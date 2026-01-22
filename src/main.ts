import path from "node:path";
import { app, ipcMain, Menu, Tray } from "electron";
import started from "electron-squirrel-startup";
import {
  centerFloatingWindow,
  createFloatingWindow,
  destroyFloatingWindow,
  getFloatingWindow,
  hideFloatingWindow,
  resizeFloatingWindow,
  showFloatingWindow,
} from "./floatingWindow";
import {
  registerGlobalShortcut,
  unregisterAllShortcuts,
} from "./globalShortcut";
import {
  IPC_INVOKE,
  IPC_MAIN_TO_RENDERER,
  IPC_RENDERER_TO_MAIN,
} from "./ipc/channels";
import {
  pasteText,
  startActiveAppTracking,
  stopActiveAppTracking,
} from "./pasteService";
import type { AppSettings } from "./settings/schema";
import { getSettings, updateSettings } from "./settings/store";
import { createSettingsWindow, destroySettingsWindow } from "./settingsWindow";
import { appStateManager } from "./state/appState";
import {
  abortTranscription,
  initializeOpenAI,
  resetOpenAI,
  transcribe,
} from "./transcription/service";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let tray: Tray | null = null;

function createTray() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "trayIconTemplate.png")
    : path.join(__dirname, "../../assets/trayIconTemplate.png");
  tray = new Tray(iconPath);
  tray.setToolTip("Politely - Voice Input");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Politely", enabled: false },
      { type: "separator" },
      {
        label: "Settings...",
        click: openSettingsWindow,
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

function openSettingsWindow() {
  const preloadPath = path.join(__dirname, "preload.settings.js");
  createSettingsWindow(preloadPath, reregisterGlobalShortcut);
}

/**
 * Re-register global shortcut from current settings.
 * Used when exiting shortcut capture mode or when settings window closes.
 */
export function reregisterGlobalShortcut() {
  const settings = getSettings();
  registerGlobalShortcut(settings.globalShortcut, handleShortcutPress);
}

function handleShortcutPress() {
  const floatingWindow = getFloatingWindow();
  if (!floatingWindow) return;

  const currentState = appStateManager.getState();

  switch (currentState) {
    case "idle":
    case "error": {
      // APIキー未設定の場合は設定画面を開く
      const settings = getSettings();
      if (!settings.apiKey) {
        openSettingsWindow();
        return;
      }

      // アクティブアプリは既にトラッキング済みなので await 不要
      if (appStateManager.transition("recording")) {
        floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.START_RECORDING);
      }
      break;
    }

    case "recording":
      if (appStateManager.transition("transcribing")) {
        floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.STOP_RECORDING);
      }
      break;

    case "transcribing":
      // 文字起こし中は何もしない
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

  ipcMain.on(IPC_RENDERER_TO_MAIN.TRANSCRIBING_CANCELLED, () => {
    console.log("[Main] Transcribing cancelled");
    abortTranscription();
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

  ipcMain.on(
    IPC_RENDERER_TO_MAIN.CENTER_WINDOW,
    (_event, width: number, height: number) => {
      centerFloatingWindow(width, height);
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
      const oldSettings = getSettings();
      updateSettings(newSettings);

      // APIキーが変更された場合、OpenAIクライアントを更新
      if (
        "apiKey" in newSettings &&
        newSettings.apiKey !== oldSettings.apiKey
      ) {
        if (newSettings.apiKey) {
          initializeOpenAI(newSettings.apiKey);
        } else {
          resetOpenAI();
        }
      }

      // showWindowOnIdleが変更された場合、即座に反映
      if (
        "showWindowOnIdle" in newSettings &&
        newSettings.showWindowOnIdle !== oldSettings.showWindowOnIdle
      ) {
        const currentState = appStateManager.getState();
        if (currentState === "idle") {
          if (newSettings.showWindowOnIdle) {
            showFloatingWindow();
          } else {
            hideFloatingWindow();
          }
        }
      }

      // グローバルショートカットが変更された場合、再登録
      if (
        "globalShortcut" in newSettings &&
        newSettings.globalShortcut !== oldSettings.globalShortcut &&
        newSettings.globalShortcut
      ) {
        const result = registerGlobalShortcut(
          newSettings.globalShortcut,
          handleShortcutPress,
        );
        if (!result.success) {
          // 登録失敗時は元のショートカットに戻す
          updateSettings({ globalShortcut: oldSettings.globalShortcut });
          event.sender.send(IPC_MAIN_TO_RENDERER.SHORTCUT_ERROR, result.error);
          // 元の設定を送信して終了
          const restoredSettings = getSettings();
          event.sender.send(
            IPC_MAIN_TO_RENDERER.SETTINGS_DATA,
            restoredSettings,
          );
          return;
        }
      }

      const settings = getSettings();
      event.sender.send(IPC_MAIN_TO_RENDERER.SETTINGS_DATA, settings);
    },
  );

  // 設定画面を開く
  ipcMain.on(IPC_RENDERER_TO_MAIN.OPEN_SETTINGS, openSettingsWindow);

  // ショートカットキャプチャ開始（設定画面でショートカット入力中）
  ipcMain.on(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_START, () => {
    unregisterAllShortcuts();
  });

  // ショートカットキャプチャ終了
  ipcMain.on(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_END, () => {
    reregisterGlobalShortcut();
  });

  // 文字起こし (IPC invoke)
  ipcMain.handle(
    IPC_INVOKE.TRANSCRIBE,
    async (_event, audioData: ArrayBuffer) => {
      return await transcribe(audioData);
    },
  );
}

app.on("ready", async () => {
  // macOS: Dock アイコンを隠す
  if (process.platform === "darwin") {
    app.dock?.hide();
  }

  // 保存済みAPIキーでOpenAIクライアントを初期化
  const settings = getSettings();
  if (settings.apiKey) {
    initializeOpenAI(settings.apiKey);
  }

  createTray();

  const preloadPath = path.join(__dirname, "preload.js");
  createFloatingWindow(preloadPath);

  // 状態変更時にRendererへブロードキャスト
  appStateManager.subscribe((state) => {
    broadcastStateChange();

    // Idle状態のときの表示制御
    if (state === "idle") {
      const settings = getSettings();
      if (settings.showWindowOnIdle) {
        showFloatingWindow();
      } else {
        hideFloatingWindow();
      }
    } else {
      // 非Idle状態（recording, transcribing, error）では常に表示
      showFloatingWindow();
    }
  });

  // ウィンドウ読み込み完了後にIdle状態でウィンドウを表示
  getFloatingWindow()?.webContents.on("did-finish-load", () => {
    // 初期状態を送信
    broadcastStateChange();
    // 設定に応じて表示
    const settings = getSettings();
    if (settings.showWindowOnIdle) {
      showFloatingWindow();
    }
  });

  setupIpcHandlers();

  registerGlobalShortcut(settings.globalShortcut, handleShortcutPress);

  // アクティブアプリのトラッキングを開始
  startActiveAppTracking();
});

// トレイアプリなのでウィンドウが閉じても終了しない
app.on("window-all-closed", () => {
  // 何もしないことでアプリを終了させない
});

app.on("will-quit", () => {
  stopActiveAppTracking();
  unregisterAllShortcuts();
});

app.on("before-quit", (event) => {
  event.preventDefault();
  destroyFloatingWindow();
  destroySettingsWindow();
  app.exit(0);
});
