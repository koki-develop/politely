import type { JSX } from "react";
import { useCallback } from "react";
import { PulseRingGray } from "./icons";

type Props = {
  onCancel: () => void;
};

/**
 * 録音準備中状態のオーバーレイ
 * グレーアウトしたアニメーションとキャンセルボタンを表示
 */
export function PreparingOverlay({ onCancel }: Props): JSX.Element {
  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCancel();
    },
    [onCancel],
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 glass-bg rounded-2xl border border-zinc-500/30 select-none [-webkit-app-region:drag]">
      {/* 準備中アニメーション + テキスト */}
      <div className="flex items-center justify-center gap-2 h-4">
        <PulseRingGray />
        <span className="text-zinc-500 text-[10px]">Preparing...</span>
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
