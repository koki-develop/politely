import type { AppState } from "../state/appState";
import type { MainToRendererChannel } from "../ipc/channels";
import type { AppSettings } from "../settings/schema";

export type StateChangePayload = {
  state: AppState;
  error: string | null;
};

export interface ElectronAPI {
  // Main -> Renderer listeners
  onStartRecording: (callback: () => void) => void;
  onStopRecording: (callback: () => void) => void;
  onAuthToken: (callback: (token: string) => void) => void;
  onStateChanged: (callback: (payload: StateChangePayload) => void) => void;

  // Renderer -> Main senders
  sendTranscriptionComplete: (text: string) => void;
  sendRecordingCancelled: () => void;
  sendRecordingError: (error: string) => void;
  sendErrorDismissed: () => void;
  setWindowSize: (width: number, height: number) => void;
  openSettings: () => void;

  // Cleanup
  removeAllListeners: (channel: MainToRendererChannel) => void;
}

export interface SettingsElectronAPI {
  // Settings
  requestSettings: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  onSettingsData: (callback: (settings: AppSettings) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    settingsAPI: SettingsElectronAPI;
  }
}
