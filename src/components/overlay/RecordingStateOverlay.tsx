import type { JSX } from "react";
import { useCallback } from "react";
import { formatShortcut } from "../../utils/shortcut";
import { PulseRing } from "./icons";

type Props = {
  shortcut: string;
  onCancel: () => void;
};

/**
 * 録音中状態のオーバーレイ
 * 録音中アニメーションとキャンセルボタンを表示
 */
export function RecordingStateOverlay({
  shortcut,
  onCancel,
}: Props): JSX.Element {
  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCancel();
    },
    [onCancel],
  );

  const shortcutDisplay = formatShortcut(shortcut);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 glass-bg rounded-2xl border border-red-500/30 select-none [-webkit-app-region:drag]">
      {/* 録音アニメーション + ショートカットヒント */}
      <div className="flex items-center justify-center gap-2 h-4">
        <PulseRing />
        <span className="text-zinc-500 text-[10px]">{shortcutDisplay}</span>
      </div>

      {/* キャンセルボタン */}
      <button
        type="button"
        onClick={handleCancelClick}
        className="text-zinc-500 hover:text-white text-[10px] transition-colors cursor-pointer [-webkit-app-region:no-drag]"
      >
        Cancel
      </button>
    </div>
  );
}
