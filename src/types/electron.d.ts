import type { AppState } from "../state/appState";
import type { MainToRendererChannel } from "../ipc/channels";

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

  // Cleanup
  removeAllListeners: (channel: MainToRendererChannel) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
