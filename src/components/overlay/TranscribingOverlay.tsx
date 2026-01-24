import type { JSX } from "react";
import { useCallback } from "react";
import { SpinnerRing } from "./icons";

type Props = {
  onCancel: () => void;
};

/**
 * 文字起こし中状態のオーバーレイ
 * ローディングアニメーションとキャンセルボタンを表示
 */
export function TranscribingOverlay({ onCancel }: Props): JSX.Element {
  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCancel();
    },
    [onCancel],
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 glass-bg rounded-2xl border border-amber-500/30 select-none [-webkit-app-region:drag]">
      {/* スピナー（Recordingのアイコン+テキストと高さを揃える） */}
      <div className="flex items-center justify-center h-4">
        <SpinnerRing />
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
