import type { AppState } from "../state/appState";
import type { MainToRendererChannel } from "../ipc/channels";
import type { PermissionsState } from "../permissions/service";
import type { AppSettings } from "../settings/schema";

export type StateChangePayload = {
  state: AppState;
  error: string | null;
};

export type TranscribeSuccessResult = { success: true; text: string };
export type TranscribeErrorResult = {
  success: false;
  error: string;
  errorCode?: string;
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
  sendRecordingError: (error: string) => void;
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

export interface SettingsElectronAPI {
  // Settings
  requestSettings: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  onSettingsData: (callback: (settings: AppSettings) => void) => void;
  onShortcutError: (callback: (error: string) => void) => void;
  removeAllListeners: (channel: string) => void;
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
