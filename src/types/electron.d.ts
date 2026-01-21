export interface ElectronAPI {
  onStartRecording: (callback: () => void) => void;
  onStopRecording: (callback: () => void) => void;
  onAuthToken: (callback: (token: string) => void) => void;
  onResetState: (callback: () => void) => void;
  sendTranscriptionComplete: (text: string) => void;
  sendRecordingCancelled: () => void;
  sendRecordingError: (error: string) => void;
  sendErrorDismissed: () => void;
  setWindowSize: (width: number, height: number) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
