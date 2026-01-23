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
import { IPC_MAIN_TO_RENDERER } from "./ipc/channels";
import {
  setupPermissionsHandlers,
  setupRecordingHandlers,
  setupSettingsHandlers,
} from "./ipc/handlers";
import { startActiveAppTracking, stopActiveAppTracking } from "./pasteService";
import { getSettings } from "./settings/store";
import { createSettingsWindow, destroySettingsWindow } from "./settingsWindow";
import { createShortcutHandler } from "./shortcut/handler";
import { appStateManager } from "./state/appState";
import { initializeOpenAI, resetOpenAI } from "./transcription/service";

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

  const settings = getSettings();
  floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.STATE_CHANGED, {
    state: appStateManager.getState(),
    error: appStateManager.getError(),
    globalShortcut: settings.globalShortcut,
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

// ショートカットハンドラの作成
const handleShortcutPress = createShortcutHandler(
  appStateManager,
  getFloatingWindow,
  openSettingsWindow,
);

/**
 * IPC ハンドラのセットアップ
 */
function setupIpcHandlers() {
  setupRecordingHandlers(
    ipcMain,
    appStateManager,
    resizeFloatingWindow,
    centerFloatingWindow,
  );

  setupSettingsHandlers(
    ipcMain,
    appStateManager,
    openSettingsWindow,
    handleShortcutPress,
    showFloatingWindow,
    hideFloatingWindow,
    initializeOpenAI,
    resetOpenAI,
  );

  setupPermissionsHandlers(ipcMain);
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
