import { ERROR_CODES, ERROR_MESSAGES } from "../errors/codes";
import type { AppError } from "../types/electron";
import {
  checkAccessibilityPermission,
  checkMicrophonePermission,
  requestMicrophonePermission,
} from "./service";

/**
 * 権限チェックの結果
 */
type PermissionCheckResult =
  | { success: true }
  | { success: false; error: AppError };

/**
 * 録音に必要な権限をチェック
 * マイク権限とアクセシビリティ権限を確認し、必要に応じてリクエストする
 */
export async function checkRecordingPermissions(): Promise<PermissionCheckResult> {
  // 1. マイク権限チェック
  const micResult = await checkMicrophonePermissionFlow();
  if (!micResult.success) {
    return micResult;
  }

  // 2. アクセシビリティ権限チェック
  const accessibilityResult = checkAccessibilityPermissionFlow();
  if (!accessibilityResult.success) {
    return accessibilityResult;
  }

  return { success: true };
}

/**
 * マイク権限のチェックとリクエスト
 */
async function checkMicrophonePermissionFlow(): Promise<PermissionCheckResult> {
  const status = checkMicrophonePermission();

  switch (status) {
    case "granted":
      return { success: true };

    case "not-determined": {
      // 初回の場合はリクエスト
      const granted = await requestMicrophonePermission();
      if (granted) {
        return { success: true };
      }
      return {
        success: false,
        error: {
          code: ERROR_CODES.MICROPHONE_NOT_GRANTED,
          message: ERROR_MESSAGES[ERROR_CODES.MICROPHONE_NOT_GRANTED],
        },
      };
    }

    default:
      return {
        success: false,
        error: {
          code: ERROR_CODES.MICROPHONE_NOT_GRANTED,
          message: ERROR_MESSAGES[ERROR_CODES.MICROPHONE_NOT_GRANTED],
        },
      };
  }
}

/**
 * アクセシビリティ権限のチェック
 */
function checkAccessibilityPermissionFlow(): PermissionCheckResult {
  // まず確認のみ（プロンプトなし）
  const status = checkAccessibilityPermission(false);

  if (status === "granted") {
    return { success: true };
  }

  // 権限がない場合はプロンプトを表示
  checkAccessibilityPermission(true);

  return {
    success: false,
    error: {
      code: ERROR_CODES.ACCESSIBILITY_NOT_GRANTED,
      message: ERROR_MESSAGES[ERROR_CODES.ACCESSIBILITY_NOT_GRANTED],
    },
  };
}
