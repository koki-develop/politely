import { useEffect } from "react";
import { WINDOW_SIZES } from "../constants/ui";
import type { ErrorCode } from "../errors/codes";
import { isPermissionError } from "../errors/codes";
import type { AppState } from "../state/appState";

/**
 * 状態に応じたウィンドウサイズを取得
 */
function getWindowSizeForState(
  state: AppState,
  errorCode: ErrorCode | null,
): { width: number; height: number } {
  switch (state) {
    case "idle":
      return WINDOW_SIZES.IDLE;
    case "recording":
      return WINDOW_SIZES.RECORDING;
    case "transcribing":
      return WINDOW_SIZES.TRANSCRIBING;
    case "error": {
      const hasAction = errorCode ? isPermissionError(errorCode) : false;
      return hasAction ? WINDOW_SIZES.ERROR_WITH_ACTION : WINDOW_SIZES.ERROR;
    }
    default:
      return WINDOW_SIZES.IDLE;
  }
}

/**
 * 状態に応じてウィンドウサイズを自動調整するカスタムフック
 */
export function useWindowSize(
  state: AppState,
  errorCode: ErrorCode | null,
): void {
  useEffect(() => {
    const size = getWindowSizeForState(state, errorCode);

    if (state === "error") {
      // エラー時は中央に配置
      window.electronAPI.centerWindow(size.width, size.height);
    } else {
      // 通常はサイズ変更のみ
      window.electronAPI.setWindowSize(size.width, size.height);
    }
  }, [state, errorCode]);
}
