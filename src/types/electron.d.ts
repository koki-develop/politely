export interface ElectronAPI {
  onStartRecording: (callback: () => void) => void;
  onStopRecording: (callback: () => void) => void;
  sendTranscriptionComplete: (text: string) => void;
  sendRecordingCancelled: () => void;
  sendRecordingError: (error: string) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
