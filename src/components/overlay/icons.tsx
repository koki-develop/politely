import { IconAlertTriangle, IconMicrophone } from "@tabler/icons-react";
import type { JSX } from "react";

const ICON_SIZE = 14;
const STROKE_WIDTH = 2;

/**
 * マイクアイコン
 */
export const MicIcon = (): JSX.Element => (
  <IconMicrophone
    size={ICON_SIZE}
    stroke={STROKE_WIDTH}
    className="text-violet-400"
    aria-hidden="true"
  />
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
  <IconAlertTriangle
    size={ICON_SIZE}
    stroke={STROKE_WIDTH}
    className="shrink-0 text-red-400"
    aria-hidden="true"
  />
);
