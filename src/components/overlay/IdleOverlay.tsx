import type { JSX } from "react";
import { formatShortcut } from "../../utils/shortcut";
import { MicIcon } from "./icons";

type Props = {
  shortcut: string;
};

/**
 * Idle 状態のオーバーレイ
 * マイクアイコンとショートカットヒントを表示
 */
export function IdleOverlay({ shortcut }: Props): JSX.Element {
  const shortcutDisplay = formatShortcut(shortcut);

  return (
    <div className="w-full h-full flex items-center justify-center gap-2 glass-bg rounded-full border border-white/10 select-none [-webkit-app-region:drag]">
      <MicIcon />
      <span className="text-zinc-500 text-[10px]">{shortcutDisplay}</span>
    </div>
  );
}
