import type { AppState } from "../state/appState";
import type { MainToRendererChannel } from "../ipc/channels";
import type { PermissionsState } from "../permissions/service";
import type { AppSettings } from "../settings/schema";
import type { ErrorCode } from "../errors/codes";

export type AppError = {
  code: ErrorCode;
  message: string;
};

export type StateChangePayload = {
  state: AppState;
  error: AppError | null;
  globalShortcut?: string;
};

export type TranscribeSuccessResult = { success: true; text: string };
export type TranscribeErrorResult = {
  success: false;
  error: string;
  errorCode: ErrorCode;
};
export type TranscribeResult = TranscribeSuccessResult | TranscribeErrorResult;

export interface ElectronAPI {
  // Main -> Renderer listeners
  onStartRecording: (callback: () => void) => void;
  onStopRecording: (callback: () => void) => void;
  onStateChanged: (callback: (payload: StateChangePayload) => void) => void;

  // Renderer -> Main senders
  sendTranscriptionComplete: (text: string) => void;
  sendRecordingCancelled: () => void;
  sendTranscribingCancelled: () => void;
  sendRecordingError: (error: AppError) => void;
  sendErrorDismissed: () => void;
  setWindowSize: (width: number, height: number) => void;
  centerWindow: (width: number, height: number) => void;
  openSettings: () => void;
  openAccessibilitySettings: () => void;
  openMicrophoneSettings: () => void;

  // Invoke (async with response)
  transcribe: (audioData: ArrayBuffer) => Promise<TranscribeResult>;

  // Cleanup
  removeAllListeners: (channel: MainToRendererChannel) => void;
}

export type UpdateSettingsResult =
  | { success: true; settings: AppSettings }
  | { success: false; error: string; settings: AppSettings };

export interface SettingsElectronAPI {
  // Settings (invoke pattern)
  getSettings: () => Promise<AppSettings>;
  updateSettings: (
    settings: Partial<AppSettings>,
  ) => Promise<UpdateSettingsResult>;
  // Shortcut capture
  startShortcutCapture: () => void;
  endShortcutCapture: () => void;
  // Permissions
  checkPermissions: () => Promise<PermissionsState>;
  requestMicrophonePermission: () => Promise<boolean>;
  openAccessibilitySettings: () => void;
  openMicrophoneSettings: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    settingsAPI: SettingsElectronAPI;
  }
}
