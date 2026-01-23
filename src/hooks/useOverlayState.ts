import { useEffect, useState } from "react";
import { IPC_MAIN_TO_RENDERER } from "../ipc/channels";
import { DEFAULT_SETTINGS } from "../settings/schema";
import type { AppState } from "../state/appState";
import type { AppError, StateChangePayload } from "../types/electron";

/**
 * オーバーレイ状態フックの戻り値
 */
export type OverlayStateHook = {
  state: AppState;
  error: AppError | null;
  globalShortcut: string;
};

/**
 * Main Process からの状態同期を行うカスタムフック
 * 状態変更とグローバルショートカット情報を管理
 */
export function useOverlayState(): OverlayStateHook {
  const [state, setState] = useState<AppState>("idle");
  const [error, setError] = useState<AppError | null>(null);
  const [globalShortcut, setGlobalShortcut] = useState<string>(
    DEFAULT_SETTINGS.globalShortcut,
  );

  useEffect(() => {
    const handleStateChange = (payload: StateChangePayload) => {
      setState(payload.state);
      setError(payload.error);
      // ショートカット情報が含まれていれば更新
      if (payload.globalShortcut) {
        setGlobalShortcut(payload.globalShortcut);
      }
    };

    window.electronAPI.onStateChanged(handleStateChange);

    return () => {
      window.electronAPI.removeAllListeners(IPC_MAIN_TO_RENDERER.STATE_CHANGED);
    };
  }, []);

  return { state, error, globalShortcut };
}
