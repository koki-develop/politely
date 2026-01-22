import path from "node:path";
import { app, ipcMain, Menu, Tray } from "electron";
import started from "electron-squirrel-startup";
import {
  createFloatingWindow,
  destroyFloatingWindow,
  getFloatingWindow,
  resizeFloatingWindow,
  showFloatingWindow,
} from "./floatingWindow";
import {
  registerGlobalShortcut,
  unregisterAllShortcuts,
} from "./globalShortcut";
import { IPC_MAIN_TO_RENDERER, IPC_RENDERER_TO_MAIN } from "./ipc/channels";
import { pasteText, savePreviousApp } from "./pasteService";
import { generateAuthToken, startServer, stopServer } from "./server";
import type { AppSettings } from "./settings/schema";
import { getSettings, updateSettings } from "./settings/store";
import { createSettingsWindow, destroySettingsWindow } from "./settingsWindow";
import { appStateManager } from "./state/appState";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let tray: Tray | null = null;

function createTray() {
  const iconPath = path.join(__dirname, "../../assets/trayIconTemplate.png");
  tray = new Tray(iconPath);
  tray.setToolTip("Politely - Voice Input");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Politely", enabled: false },
      { type: "separator" },
      {
        label: "Settings...",
        click: () => {
          const preloadPath = path.join(__dirname, "preload.settings.js");
          createSettingsWindow(preloadPath);
        },
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}

/**
 * Broadcast state change to renderer
 */
function broadcastStateChange() {
  const floatingWindow = getFloatingWindow();
  if (!floatingWindow) return;

  floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.STATE_CHANGED, {
    state: appStateManager.getState(),
    error: appStateManager.getError(),
  });
}

async function handleShortcutPress() {
  const floatingWindow = getFloatingWindow();
  if (!floatingWindow) return;

  const currentState = appStateManager.getState();

  switch (currentState) {
    case "idle":
      await savePreviousApp();
      if (appStateManager.transition("recording")) {
        floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.START_RECORDING);
      }
      break;

    case "recording":
      if (appStateManager.transition("transcribing")) {
        floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.STOP_RECORDING);
      }
      break;

    case "transcribing":
      // 文字起こし中は何もしない
      break;

    case "error":
      // エラー表示中はエラーをクリアして録音を開始
      await savePreviousApp();
      if (appStateManager.transition("recording")) {
        floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.START_RECORDING);
      }
      break;
  }
}

function setupIpcHandlers() {
  ipcMain.on(
    IPC_RENDERER_TO_MAIN.TRANSCRIPTION_COMPLETE,
    async (_event, text: string) => {
      console.log("[Main] Transcription complete:", text);

      appStateManager.transition("idle");

      try {
        await pasteText(text);
      } catch (error) {
        console.error("[Main] Failed to paste:", error);
      }
    },
  );

  ipcMain.on(IPC_RENDERER_TO_MAIN.RECORDING_CANCELLED, () => {
    console.log("[Main] Recording cancelled");
    appStateManager.transition("idle");
  });

  ipcMain.on(IPC_RENDERER_TO_MAIN.RECORDING_ERROR, (_event, error: string) => {
    console.error("[Main] Recording error:", error);
    appStateManager.transition("error", error);
  });

  ipcMain.on(IPC_RENDERER_TO_MAIN.ERROR_DISMISSED, () => {
    console.log("[Main] Error dismissed");
    appStateManager.transition("idle");
  });

  ipcMain.on(
    IPC_RENDERER_TO_MAIN.SET_WINDOW_SIZE,
    (_event, width: number, height: number) => {
      resizeFloatingWindow(width, height);
    },
  );

  // Settings IPC handlers
  ipcMain.on(IPC_RENDERER_TO_MAIN.GET_SETTINGS, (event) => {
    const settings = getSettings();
    event.sender.send(IPC_MAIN_TO_RENDERER.SETTINGS_DATA, settings);
  });

  ipcMain.on(
    IPC_RENDERER_TO_MAIN.UPDATE_SETTINGS,
    (event, newSettings: Partial<AppSettings>) => {
      updateSettings(newSettings);
      const settings = getSettings();
      event.sender.send(IPC_MAIN_TO_RENDERER.SETTINGS_DATA, settings);
    },
  );
}

app.on("ready", async () => {
  // macOS: Dock アイコンを隠す
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  const authToken = generateAuthToken();
  await startServer(3001);

  createTray();

  const preloadPath = path.join(__dirname, "preload.js");
  createFloatingWindow(preloadPath);

  // 状態変更時にRendererへブロードキャスト
  appStateManager.subscribe(() => {
    broadcastStateChange();
  });

  // ウィンドウ読み込み完了後に認証トークンを送信し、Idle状態でウィンドウを表示
  getFloatingWindow()?.webContents.on("did-finish-load", () => {
    getFloatingWindow()?.webContents.send(
      IPC_MAIN_TO_RENDERER.AUTH_TOKEN,
      authToken,
    );
    // 初期状態を送信
    broadcastStateChange();
    showFloatingWindow();
  });

  setupIpcHandlers();

  registerGlobalShortcut(handleShortcutPress);
});

// トレイアプリなのでウィンドウが閉じても終了しない
app.on("window-all-closed", () => {
  // 何もしないことでアプリを終了させない
});

app.on("will-quit", () => {
  unregisterAllShortcuts();
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  destroyFloatingWindow();
  destroySettingsWindow();
  await stopServer();
  app.exit(0);
});
