import type { BrowserWindow } from "electron";
import { IPC_MAIN_TO_RENDERER } from "../ipc/channels";
import { checkRecordingPermissions } from "../permissions/permissionChecker";
import { getSettings } from "../settings/store";
import type { AppStateManager } from "../state/appState";

/**
 * ショートカットハンドラを作成
 */
export function createShortcutHandler(
  appStateManager: AppStateManager,
  getFloatingWindow: () => BrowserWindow | null,
  openSettingsWindow: () => void,
): () => Promise<void> {
  return async function handleShortcutPress(): Promise<void> {
    const floatingWindow = getFloatingWindow();
    if (!floatingWindow) return;

    const currentState = appStateManager.getState();

    switch (currentState) {
      case "idle":
      case "error":
        await handleIdleOrErrorState(
          appStateManager,
          floatingWindow,
          openSettingsWindow,
        );
        break;

      case "recording":
        handleRecordingState(appStateManager, floatingWindow);
        break;

      case "transcribing":
        // transcribing 中はショートカットを無視
        break;
    }
  };
}

/**
 * idle または error 状態でのショートカット処理
 * 録音を開始する
 */
async function handleIdleOrErrorState(
  appStateManager: AppStateManager,
  floatingWindow: BrowserWindow,
  openSettingsWindow: () => void,
): Promise<void> {
  // 1. APIキーの確認
  const settings = getSettings();
  if (!settings.apiKey) {
    openSettingsWindow();
    return;
  }

  // 2. 権限チェック
  const permissionResult = await checkRecordingPermissions();
  if (!permissionResult.success) {
    appStateManager.transition("error", permissionResult.error);
    return;
  }

  // 3. 録音開始
  if (appStateManager.transition("recording")) {
    floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.START_RECORDING);
  }
}

/**
 * recording 状態でのショートカット処理
 * 録音を停止して文字起こしを開始する
 */
function handleRecordingState(
  appStateManager: AppStateManager,
  floatingWindow: BrowserWindow,
): void {
  if (appStateManager.transition("transcribing")) {
    floatingWindow.webContents.send(IPC_MAIN_TO_RENDERER.STOP_RECORDING);
  }
}
