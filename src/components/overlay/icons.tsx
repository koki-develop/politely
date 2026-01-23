import type { JSX } from "react";

const ICON_SIZE = 14;
const STROKE_WIDTH = 2;

/**
 * マイクアイコン
 */
export const MicIcon = (): JSX.Element => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-violet-400"
    aria-hidden="true"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

/**
 * 録音中のパルスリング
 * 赤からオレンジのグラデーションでパルスアニメーションを表示
 */
export const PulseRing = (): JSX.Element => (
  <div className="relative flex items-center justify-center">
    <div className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-red-500/40 to-orange-500/40 animate-pulse-ring" />
    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
  </div>
);

/**
 * 処理中のウェーブドット
 */
export const WaveDots = (): JSX.Element => (
  <div className="flex items-center justify-center gap-1.5 h-4">
    <div className="w-2 h-2 rounded-full bg-amber-400 animate-wave" />
    <div className="w-2 h-2 rounded-full bg-amber-400 animate-wave-delay-1" />
    <div className="w-2 h-2 rounded-full bg-amber-400 animate-wave-delay-2" />
  </div>
);

/**
 * 警告アイコン
 */
export const AlertIcon = (): JSX.Element => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-400"
    aria-hidden="true"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
