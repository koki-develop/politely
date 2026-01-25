import path from "node:path";
import { app, ipcMain } from "electron";
import started from "electron-squirrel-startup";
import {
  centerFloatingWindow,
  createFloatingWindow,
  destroyFloatingWindow,
  getFloatingWindow,
  hideFloatingWindow,
  resizeFloatingWindow,
  showFloatingWindow,
  updateWindowSizeForState,
} from "./floatingWindow";
import {
  registerGlobalShortcut,
  unregisterAllShortcuts,
} from "./globalShortcut";
import { IPC_MAIN_TO_RENDERER } from "./ipc/channels";
import {
  setupOnboardingHandlers,
  setupPermissionsHandlers,
  setupRecordingHandlers,
  setupSettingsHandlers,
} from "./ipc/handlers";
import { isOnboardingCompleted } from "./onboarding/store";
import {
  createOnboardingWindow,
  destroyOnboardingWindow,
} from "./onboardingWindow";
import { getSettings, updateSettings } from "./settings/store";
import { createSettingsWindow, destroySettingsWindow } from "./settingsWindow";
import { createShortcutHandler } from "./shortcut/handler";
import { appStateManager } from "./state/appState";
import { initializeOpenAI, resetOpenAI } from "./transcription/service";
import { createTray, updateTrayMenu } from "./trayMenu";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
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
    rawText: appStateManager.getRawText(),
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
  // ショートカット表示を更新
  updateTrayMenu(appStateManager.getState());
}

// ショートカットハンドラの作成
const handleShortcutPress = createShortcutHandler(
  appStateManager,
  getFloatingWindow,
  openSettingsWindow,
);

/**
 * Dock アイコンの表示/非表示を切り替える
 */
async function setDockVisibility(
  visible: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (visible) {
      await app.dock?.show();
    } else {
      app.dock?.hide();
    }
    return { success: true };
  } catch (error) {
    console.error("[Main] Failed to change dock visibility:", error);
    return {
      success: false,
      error: "Dock アイコンの表示切替に失敗しました",
    };
  }
}

/**
 * ログイン時の自動起動を設定する
 */
function setLaunchAtLogin(enabled: boolean): {
  success: boolean;
  error?: string;
} {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
    });

    // 設定が適用されたか確認
    const settings = app.getLoginItemSettings();
    if (settings.openAtLogin !== enabled) {
      // macOS 13+ では承認が必要な場合がある
      if (settings.status === "requires-approval") {
        return {
          success: false,
          error: "ログイン項目の設定にはシステム設定での承認が必要です",
        };
      }
      return {
        success: false,
        error: "ログイン時の自動起動設定に失敗しました",
      };
    }
    return { success: true };
  } catch (error) {
    console.error("[Main] Failed to set launch at login:", error);
    return {
      success: false,
      error: "ログイン時の自動起動設定に失敗しました",
    };
  }
}

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
    setDockVisibility,
    setLaunchAtLogin,
  );

  setupPermissionsHandlers(ipcMain);

  setupOnboardingHandlers(ipcMain);
}

/**
 * フローティングウィンドウを初期化して表示する
 */
function initializeFloatingWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  createFloatingWindow(preloadPath);

  // 状態変更時にウィンドウサイズを更新してRendererへブロードキャスト
  appStateManager.subscribe((state, error) => {
    // トレイメニューを更新
    updateTrayMenu(state);

    // 状態変更と同時にウィンドウサイズを変更（IPC往復なし）
    updateWindowSizeForState(state, error?.code ?? null);

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

  // グローバルショートカットを登録
  const settings = getSettings();
  registerGlobalShortcut(settings.globalShortcut, handleShortcutPress);
}

app.on("ready", async () => {
  // 保存済みAPIキーでOpenAIクライアントを初期化
  const settings = getSettings();

  // macOS: 設定に基づいて Dock アイコンを表示
  // LSUIElement: true により起動時はデフォルトで Dock 非表示
  if (settings.showDockIcon) {
    try {
      await app.dock?.show();
      console.log("[Main] Dock icon shown based on settings");
    } catch (error) {
      console.error("[Main] Failed to show dock icon on startup:", error);
    }
  }

  // ログイン項目の状態を同期
  // ユーザーがシステム設定から変更した場合に設定を同期する
  const loginItemSettings = app.getLoginItemSettings();
  if (loginItemSettings.openAtLogin !== settings.launchAtLogin) {
    console.log(
      `[Main] Syncing login item settings: system=${loginItemSettings.openAtLogin}, stored=${settings.launchAtLogin}`,
    );
    updateSettings({ launchAtLogin: loginItemSettings.openAtLogin });
  }

  if (settings.apiKey) {
    initializeOpenAI(settings.apiKey);
  }

  createTray(openSettingsWindow, handleShortcutPress);
  setupIpcHandlers();

  // オンボーディングが完了していない場合はオンボーディングウィンドウを表示
  if (!isOnboardingCompleted()) {
    const onboardingPreloadPath = path.join(__dirname, "preload.onboarding.js");
    createOnboardingWindow(onboardingPreloadPath, () => {
      // オンボーディング完了後にフローティングウィンドウを初期化
      // 設定が変更されている可能性があるので再取得
      const updatedSettings = getSettings();
      if (updatedSettings.apiKey) {
        initializeOpenAI(updatedSettings.apiKey);
      }
      initializeFloatingWindow();
    });
  } else {
    // オンボーディング完了済みの場合は通常起動
    initializeFloatingWindow();
  }
});

// トレイアプリなのでウィンドウが閉じても終了しない
app.on("window-all-closed", () => {
  // 何もしないことでアプリを終了させない
});

app.on("will-quit", () => {
  unregisterAllShortcuts();
});

app.on("before-quit", (event) => {
  event.preventDefault();
  destroyFloatingWindow();
  destroySettingsWindow();
  destroyOnboardingWindow();
  app.exit(0);
});
