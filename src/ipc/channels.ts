/**
 * IPC Channel definitions for type-safe communication between Main and Renderer processes.
 */

// Main -> Renderer channels
export const IPC_MAIN_TO_RENDERER = {
  START_RECORDING: "start-recording",
  STOP_RECORDING: "stop-recording",
  STATE_CHANGED: "state-changed",
} as const;

// Invoke channels (Renderer -> Main with response)
export const IPC_INVOKE = {
  TRANSCRIBE_AUDIO: "transcribe-audio",
  CONVERT_TO_POLITE: "convert-to-polite",
  CHECK_PERMISSIONS: "check-permissions",
  REQUEST_MICROPHONE_PERMISSION: "request-microphone-permission",
  REQUEST_ACCESSIBILITY_PERMISSION: "request-accessibility-permission",
  GET_SETTINGS: "get-settings",
  UPDATE_SETTINGS: "update-settings",
  // Onboarding
  GET_ONBOARDING_STATE: "get-onboarding-state",
  UPDATE_ONBOARDING_STATE: "update-onboarding-state",
  COMPLETE_ONBOARDING: "complete-onboarding",
} as const;

// Renderer -> Main channels
export const IPC_RENDERER_TO_MAIN = {
  RECORDING_STARTED: "recording-started",
  TRANSCRIPTION_COMPLETE: "transcription-complete",
  TRANSCRIPTION_PROGRESS: "transcription-progress",
  RECORDING_CANCELLED: "recording-cancelled",
  TRANSCRIBING_CANCELLED: "transcribing-cancelled",
  CONVERTING_CANCELLED: "converting-cancelled",
  RECORDING_ERROR: "recording-error",
  ERROR_DISMISSED: "error-dismissed",
  SET_WINDOW_SIZE: "set-window-size",
  CENTER_WINDOW: "center-window",
  // Settings
  OPEN_SETTINGS: "open-settings",
  // Shortcut capture
  SHORTCUT_CAPTURE_START: "shortcut-capture-start",
  SHORTCUT_CAPTURE_END: "shortcut-capture-end",
  // Permissions
  OPEN_ACCESSIBILITY_SETTINGS: "open-accessibility-settings",
  OPEN_MICROPHONE_SETTINGS: "open-microphone-settings",
} as const;

// Type exports
export type MainToRendererChannel =
  (typeof IPC_MAIN_TO_RENDERER)[keyof typeof IPC_MAIN_TO_RENDERER];
