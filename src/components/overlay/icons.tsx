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
 * 準備中のパルスリング（グレー）
 */
export const PulseRingGray = (): JSX.Element => (
  <div className="relative flex items-center justify-center">
    <div className="absolute w-4 h-4 rounded-full bg-zinc-500/40 animate-pulse-ring" />
    <div className="w-2 h-2 rounded-full bg-zinc-500" />
  </div>
);

/**
 * 文字起こし中のスピナーリング
 * 琥珀からオレンジへのグラデーションアークが回転
 */
export const SpinnerRing = (): JSX.Element => (
  <div className="relative flex items-center justify-center w-4 h-4">
    <svg
      className="w-4 h-4 animate-spin-progress"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        className="text-amber-400/20"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="url(#spinner-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient
          id="spinner-gradient"
          x1="12"
          y1="2"
          x2="22"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
    </svg>
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
