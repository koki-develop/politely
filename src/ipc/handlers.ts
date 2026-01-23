import type { IpcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import { ERROR_CODES, ERROR_MESSAGES } from "../errors/codes";
import {
  registerGlobalShortcut,
  unregisterAllShortcuts,
} from "../globalShortcut";
import {
  completeOnboarding,
  getOnboardingState,
  isOnboardingCompleted,
  updateOnboardingState,
} from "../onboarding/store";
import { PasteError, pasteText } from "../pasteService";
import {
  checkAllPermissions,
  openAccessibilitySettings,
  openMicrophoneSettings,
  requestMicrophonePermission,
} from "../permissions/service";
import type { AppSettings, OnboardingState } from "../settings/schema";
import { getSettings, updateSettings } from "../settings/store";
import type { AppStateManager } from "../state/appState";
import { abortTranscription, transcribe } from "../transcription/service";
import type { AppError, UpdateSettingsResult } from "../types/electron";
import { IPC_INVOKE, IPC_RENDERER_TO_MAIN } from "./channels";

/**
 * 録音関連の IPC ハンドラをセットアップ
 */
export function setupRecordingHandlers(
  ipcMain: IpcMain,
  appStateManager: AppStateManager,
  resizeFloatingWindow: (width: number, height: number) => void,
  centerFloatingWindow: (width: number, height: number) => void,
): void {
  // 文字起こし完了
  ipcMain.on(
    IPC_RENDERER_TO_MAIN.TRANSCRIPTION_COMPLETE,
    async (_event: IpcMainEvent, text: string) => {
      console.log("[Main] Transcription complete:", text);

      try {
        await pasteText(text);
        appStateManager.transition("idle");
      } catch (error) {
        console.error("[Main] Failed to paste:", error);

        if (error instanceof PasteError) {
          appStateManager.transition("error", {
            code: error.code,
            message: error.message,
          });
        } else {
          appStateManager.transition("error", {
            code: ERROR_CODES.PASTE_FAILED,
            message: ERROR_MESSAGES[ERROR_CODES.PASTE_FAILED],
          });
        }
      }
    },
  );

  // 録音キャンセル
  ipcMain.on(IPC_RENDERER_TO_MAIN.RECORDING_CANCELLED, () => {
    console.log("[Main] Recording cancelled");
    appStateManager.transition("idle");
  });

  // 文字起こしキャンセル
  ipcMain.on(IPC_RENDERER_TO_MAIN.TRANSCRIBING_CANCELLED, () => {
    console.log("[Main] Transcribing cancelled");
    abortTranscription();
    appStateManager.transition("idle");
  });

  // 録音エラー
  ipcMain.on(
    IPC_RENDERER_TO_MAIN.RECORDING_ERROR,
    (_event: IpcMainEvent, error: AppError) => {
      console.error("[Main] Recording error:", error.message);
      appStateManager.transition("error", error);
    },
  );

  // エラー dismiss
  ipcMain.on(IPC_RENDERER_TO_MAIN.ERROR_DISMISSED, () => {
    console.log("[Main] Error dismissed");
    appStateManager.transition("idle");
  });

  // ウィンドウサイズ変更
  ipcMain.on(
    IPC_RENDERER_TO_MAIN.SET_WINDOW_SIZE,
    (_event: IpcMainEvent, width: number, height: number) => {
      resizeFloatingWindow(width, height);
    },
  );

  // ウィンドウ中央配置
  ipcMain.on(
    IPC_RENDERER_TO_MAIN.CENTER_WINDOW,
    (_event: IpcMainEvent, width: number, height: number) => {
      centerFloatingWindow(width, height);
    },
  );

  // 文字起こし invoke
  ipcMain.handle(
    IPC_INVOKE.TRANSCRIBE,
    async (_event: IpcMainInvokeEvent, audioData: ArrayBuffer) => {
      return await transcribe(audioData);
    },
  );
}

/**
 * 設定関連の IPC ハンドラをセットアップ
 */
export function setupSettingsHandlers(
  ipcMain: IpcMain,
  appStateManager: AppStateManager,
  openSettingsWindow: () => void,
  handleShortcutPress: () => Promise<void>,
  showFloatingWindow: () => void,
  hideFloatingWindow: () => void,
  initializeOpenAI: (apiKey: string) => void,
  resetOpenAI: () => void,
): void {
  // 設定画面を開く
  ipcMain.on(IPC_RENDERER_TO_MAIN.OPEN_SETTINGS, openSettingsWindow);

  // 設定取得
  ipcMain.handle(IPC_INVOKE.GET_SETTINGS, () => {
    return getSettings();
  });

  // 設定更新
  ipcMain.handle(
    IPC_INVOKE.UPDATE_SETTINGS,
    (
      _event: IpcMainInvokeEvent,
      newSettings: Partial<AppSettings>,
    ): UpdateSettingsResult => {
      const oldSettings = getSettings();

      // ショートカット変更時は先に登録を試みる（オンボーディング中は登録しない）
      if (
        newSettings.globalShortcut !== undefined &&
        newSettings.globalShortcut !== oldSettings.globalShortcut &&
        isOnboardingCompleted()
      ) {
        const shortcutResult = registerGlobalShortcut(
          newSettings.globalShortcut,
          handleShortcutPress,
        );
        if (!shortcutResult.success) {
          // 登録失敗時は設定を変更せずエラーを返す
          return {
            success: false,
            error: shortcutResult.error,
            settings: oldSettings,
          };
        }
      }

      // 設定を更新
      const result = updateSettings(newSettings);
      if (!result.success) {
        return {
          success: false,
          error: result.error ?? "設定の更新に失敗しました",
          settings: oldSettings,
        };
      }

      // APIキー変更時の処理
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

      // showWindowOnIdle 変更時の処理
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

      return {
        success: true,
        settings: getSettings(),
      };
    },
  );

  // ショートカットキャプチャ開始（設定画面でショートカット入力中）
  ipcMain.on(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_START, () => {
    unregisterAllShortcuts();
  });

  // ショートカットキャプチャ終了
  ipcMain.on(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_END, () => {
    // オンボーディング中はショートカットを登録しない
    if (!isOnboardingCompleted()) {
      return;
    }
    const settings = getSettings();
    registerGlobalShortcut(settings.globalShortcut, handleShortcutPress);
  });
}

/**
 * 権限関連の IPC ハンドラをセットアップ
 */
export function setupPermissionsHandlers(ipcMain: IpcMain): void {
  // 権限状態取得
  ipcMain.handle(IPC_INVOKE.CHECK_PERMISSIONS, () => {
    return checkAllPermissions();
  });

  // マイク権限リクエスト
  ipcMain.handle(IPC_INVOKE.REQUEST_MICROPHONE_PERMISSION, async () => {
    return await requestMicrophonePermission();
  });

  // マイク設定を開く
  ipcMain.on(IPC_RENDERER_TO_MAIN.OPEN_MICROPHONE_SETTINGS, () => {
    openMicrophoneSettings();
  });

  // アクセシビリティ設定を開く
  ipcMain.on(IPC_RENDERER_TO_MAIN.OPEN_ACCESSIBILITY_SETTINGS, () => {
    openAccessibilitySettings();
  });
}

/**
 * オンボーディング関連の IPC ハンドラをセットアップ
 */
export function setupOnboardingHandlers(ipcMain: IpcMain): void {
  // オンボーディング状態取得
  ipcMain.handle(IPC_INVOKE.GET_ONBOARDING_STATE, () => {
    try {
      return getOnboardingState();
    } catch (error) {
      console.error("[Main] Failed to get onboarding state:", error);
      throw error;
    }
  });

  // オンボーディング状態更新
  ipcMain.handle(
    IPC_INVOKE.UPDATE_ONBOARDING_STATE,
    (_event: IpcMainInvokeEvent, state: Partial<OnboardingState>) => {
      try {
        return updateOnboardingState(state);
      } catch (error) {
        console.error("[Main] Failed to update onboarding state:", error);
        throw error;
      }
    },
  );

  // オンボーディング完了
  ipcMain.handle(IPC_INVOKE.COMPLETE_ONBOARDING, () => {
    try {
      completeOnboarding();
    } catch (error) {
      console.error("[Main] Failed to complete onboarding:", error);
      throw error;
    }
  });
}
