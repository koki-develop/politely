/**
 * アプリケーション全体で使用するエラーコード
 */
export const ERROR_CODES = {
  // Permission errors
  MICROPHONE_NOT_GRANTED: "MICROPHONE_NOT_GRANTED",
  ACCESSIBILITY_NOT_GRANTED: "ACCESSIBILITY_NOT_GRANTED",

  // API errors
  API_KEY_NOT_CONFIGURED: "API_KEY_NOT_CONFIGURED",
  TRANSCRIPTION_FAILED: "TRANSCRIPTION_FAILED",
  TRANSCRIPTION_CANCELLED: "TRANSCRIPTION_CANCELLED",
  CONVERSION_FAILED: "CONVERSION_FAILED",

  // Paste errors
  PASTE_FAILED: "PASTE_FAILED",

  // Recording errors
  RECORDING_FAILED: "RECORDING_FAILED",
  NO_SPEECH_DETECTED: "NO_SPEECH_DETECTED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * エラーコードからユーザー向けメッセージへのマッピング
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.MICROPHONE_NOT_GRANTED]:
    "マイクへのアクセスを許可してください。",
  [ERROR_CODES.ACCESSIBILITY_NOT_GRANTED]:
    "アクセシビリティへのアクセスを許可してください。",
  [ERROR_CODES.API_KEY_NOT_CONFIGURED]: "APIキーが設定されていません。",
  [ERROR_CODES.TRANSCRIPTION_FAILED]: "文字起こしに失敗しました。",
  [ERROR_CODES.TRANSCRIPTION_CANCELLED]: "文字起こしがキャンセルされました。",
  [ERROR_CODES.CONVERSION_FAILED]: "丁寧語変換に失敗しました。",
  [ERROR_CODES.PASTE_FAILED]: "ペーストに失敗しました。",
  [ERROR_CODES.RECORDING_FAILED]: "録音に失敗しました。",
  [ERROR_CODES.NO_SPEECH_DETECTED]: "音声が検出されませんでした。",
};

/**
 * 権限エラーかどうかを判定
 */
export function isPermissionError(code: ErrorCode): boolean {
  return (
    code === ERROR_CODES.MICROPHONE_NOT_GRANTED ||
    code === ERROR_CODES.ACCESSIBILITY_NOT_GRANTED
  );
}

/**
 * 権限エラーの種類を判定
 */
export function getPermissionErrorType(
  code: ErrorCode,
): "microphone" | "accessibility" | null {
  if (code === ERROR_CODES.MICROPHONE_NOT_GRANTED) return "microphone";
  if (code === ERROR_CODES.ACCESSIBILITY_NOT_GRANTED) return "accessibility";
  return null;
}
