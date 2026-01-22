// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { IPC_MAIN_TO_RENDERER, IPC_RENDERER_TO_MAIN } from "./ipc/channels";

contextBridge.exposeInMainWorld("electronAPI", {
  onStartRecording: (callback: () => void) => {
    ipcRenderer.on(IPC_MAIN_TO_RENDERER.START_RECORDING, callback);
  },
  onStopRecording: (callback: () => void) => {
    ipcRenderer.on(IPC_MAIN_TO_RENDERER.STOP_RECORDING, callback);
  },
  onAuthToken: (callback: (token: string) => void) => {
    ipcRenderer.on(IPC_MAIN_TO_RENDERER.AUTH_TOKEN, (_event, token) =>
      callback(token),
    );
  },
  onStateChanged: (
    callback: (payload: { state: string; error: string | null }) => void,
  ) => {
    ipcRenderer.on(IPC_MAIN_TO_RENDERER.STATE_CHANGED, (_event, payload) =>
      callback(payload),
    );
  },

  sendTranscriptionComplete: (text: string) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.TRANSCRIPTION_COMPLETE, text);
  },
  sendRecordingCancelled: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.RECORDING_CANCELLED);
  },
  sendRecordingError: (error: string) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.RECORDING_ERROR, error);
  },
  sendErrorDismissed: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.ERROR_DISMISSED);
  },
  setWindowSize: (width: number, height: number) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.SET_WINDOW_SIZE, width, height);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
