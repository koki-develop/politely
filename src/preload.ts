// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onStartRecording: (callback: () => void) => {
    ipcRenderer.on("start-recording", callback);
  },
  onStopRecording: (callback: () => void) => {
    ipcRenderer.on("stop-recording", callback);
  },
  onAuthToken: (callback: (token: string) => void) => {
    ipcRenderer.on("auth-token", (_event, token) => callback(token));
  },
  onResetToIdle: (callback: () => void) => {
    ipcRenderer.on("reset-to-idle", callback);
  },

  sendTranscriptionComplete: (text: string) => {
    ipcRenderer.send("transcription-complete", text);
  },
  sendRecordingCancelled: () => {
    ipcRenderer.send("recording-cancelled");
  },
  sendRecordingError: (error: string) => {
    ipcRenderer.send("recording-error", error);
  },
  sendErrorDismissed: () => {
    ipcRenderer.send("error-dismissed");
  },
  setWindowSize: (width: number, height: number) => {
    ipcRenderer.send("set-window-size", width, height);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
