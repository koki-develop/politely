import type { JSX } from "react";
import { useCallback } from "react";
import { type ErrorCode, getPermissionErrorType } from "../../errors/codes";
import { AlertIcon } from "./icons";

type Props = {
  errorCode: ErrorCode | null;
  errorMessage: string;
  onDismiss: () => void;
};

/**
 * エラー状態のオーバーレイ
 * エラーメッセージと解決アクションを表示
 */
export function ErrorOverlay({
  errorCode,
  errorMessage,
  onDismiss,
}: Props): JSX.Element {
  const permissionType = errorCode ? getPermissionErrorType(errorCode) : null;

  const handleOpenSettings = useCallback(() => {
    if (permissionType === "microphone") {
      window.electronAPI.openMicrophoneSettings();
    } else if (permissionType === "accessibility") {
      window.electronAPI.openAccessibilitySettings();
    }
    onDismiss();
  }, [permissionType, onDismiss]);

  const handleDismissClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDismiss();
    },
    [onDismiss],
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center glass-bg rounded-2xl border border-red-500/40 px-4 py-3 select-none [-webkit-app-region:drag]">
      <div className="flex items-center gap-2">
        <AlertIcon />
        <div className="max-h-12 overflow-y-auto [-webkit-app-region:no-drag]">
          <span className="text-red-400 text-xs break-all block">
            {errorMessage || "エラーが発生しました"}
          </span>
        </div>
      </div>

      {/* ボタン群 */}
      <div className="flex items-center gap-3 mt-2 [-webkit-app-region:no-drag]">
        {permissionType && (
          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-3 py-1 text-violet-400 bg-violet-500/10 rounded-lg border border-violet-500/20 hover:bg-violet-500/20 text-xs transition-colors cursor-pointer"
          >
            設定を開く
          </button>
        )}
        <button
          type="button"
          onClick={handleDismissClick}
          className="text-zinc-500 hover:text-white text-xs transition-colors cursor-pointer"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
