/**
 * フローティングウィンドウのサイズ定数
 */
export const WINDOW_SIZES = {
  IDLE: { width: 110, height: 32 },
  PREPARING: { width: 130, height: 56 },
  RECORDING: { width: 130, height: 56 },
  TRANSCRIBING: { width: 100, height: 56 },
  ERROR: { width: 280, height: 100 },
  ERROR_WITH_ACTION: { width: 280, height: 120 },
} as const;

/**
 * フローティングウィンドウの設定
 */
export const FLOATING_WINDOW = {
  BOTTOM_MARGIN: -16,
  DEFAULT_WIDTH: 130,
  DEFAULT_HEIGHT: 32,
} as const;

/**
 * タイミング定数
 */
export const TIMING = {
  /** クリップボード書き込み後の遅延（ミリ秒） */
  CLIPBOARD_WRITE_DELAY_MS: 50,
} as const;
