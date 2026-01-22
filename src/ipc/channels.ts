/**
 * IPC Channel definitions for type-safe communication between Main and Renderer processes.
 */

// Main -> Renderer channels
export const IPC_MAIN_TO_RENDERER = {
  START_RECORDING: "start-recording",
  STOP_RECORDING: "stop-recording",
  STATE_CHANGED: "state-changed",
  // Settings
  SETTINGS_DATA: "settings-data",
} as const;

// Invoke channels (Renderer -> Main with response)
export const IPC_INVOKE = {
  TRANSCRIBE: "transcribe",
} as const;

// Renderer -> Main channels
export const IPC_RENDERER_TO_MAIN = {
  TRANSCRIPTION_COMPLETE: "transcription-complete",
  RECORDING_CANCELLED: "recording-cancelled",
  RECORDING_ERROR: "recording-error",
  ERROR_DISMISSED: "error-dismissed",
  SET_WINDOW_SIZE: "set-window-size",
  CENTER_WINDOW: "center-window",
  // Settings
  GET_SETTINGS: "get-settings",
  UPDATE_SETTINGS: "update-settings",
  OPEN_SETTINGS: "open-settings",
} as const;

// Type exports
export type MainToRendererChannel =
  (typeof IPC_MAIN_TO_RENDERER)[keyof typeof IPC_MAIN_TO_RENDERER];
export type RendererToMainChannel =
  (typeof IPC_RENDERER_TO_MAIN)[keyof typeof IPC_RENDERER_TO_MAIN];
