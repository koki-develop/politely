/**
 * IPC Channel definitions for type-safe communication between Main and Renderer processes.
 */

// Main -> Renderer channels
export const IPC_MAIN_TO_RENDERER = {
  START_RECORDING: "start-recording",
  STOP_RECORDING: "stop-recording",
  AUTH_TOKEN: "auth-token",
  STATE_CHANGED: "state-changed",
} as const;

// Renderer -> Main channels
export const IPC_RENDERER_TO_MAIN = {
  TRANSCRIPTION_COMPLETE: "transcription-complete",
  RECORDING_CANCELLED: "recording-cancelled",
  RECORDING_ERROR: "recording-error",
  ERROR_DISMISSED: "error-dismissed",
  SET_WINDOW_SIZE: "set-window-size",
} as const;

// Type exports
export type MainToRendererChannel =
  (typeof IPC_MAIN_TO_RENDERER)[keyof typeof IPC_MAIN_TO_RENDERER];
export type RendererToMainChannel =
  (typeof IPC_RENDERER_TO_MAIN)[keyof typeof IPC_RENDERER_TO_MAIN];
