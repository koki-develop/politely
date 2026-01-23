// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import type { MainToRendererChannel } from "./ipc/channels";
import {
  IPC_INVOKE,
  IPC_MAIN_TO_RENDERER,
  IPC_RENDERER_TO_MAIN,
} from "./ipc/channels";
import type {
  AppError,
  StateChangePayload,
  TranscribeResult,
} from "./types/electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onStartRecording: (callback: () => void) => {
    ipcRenderer.on(IPC_MAIN_TO_RENDERER.START_RECORDING, callback);
  },
  onStopRecording: (callback: () => void) => {
    ipcRenderer.on(IPC_MAIN_TO_RENDERER.STOP_RECORDING, callback);
  },
  onStateChanged: (callback: (payload: StateChangePayload) => void) => {
    ipcRenderer.on(
      IPC_MAIN_TO_RENDERER.STATE_CHANGED,
      (_event: Electron.IpcRendererEvent, payload: StateChangePayload) =>
        callback(payload),
    );
  },

  sendTranscriptionComplete: (text: string) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.TRANSCRIPTION_COMPLETE, text);
  },
  sendRecordingCancelled: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.RECORDING_CANCELLED);
  },
  sendTranscribingCancelled: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.TRANSCRIBING_CANCELLED);
  },
  sendRecordingError: (error: AppError) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.RECORDING_ERROR, error);
  },
  sendErrorDismissed: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.ERROR_DISMISSED);
  },
  setWindowSize: (width: number, height: number) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.SET_WINDOW_SIZE, width, height);
  },
  centerWindow: (width: number, height: number) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.CENTER_WINDOW, width, height);
  },
  openSettings: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.OPEN_SETTINGS);
  },
  openAccessibilitySettings: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.OPEN_ACCESSIBILITY_SETTINGS);
  },
  openMicrophoneSettings: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.OPEN_MICROPHONE_SETTINGS);
  },

  transcribe: (audioData: ArrayBuffer): Promise<TranscribeResult> => {
    return ipcRenderer.invoke(IPC_INVOKE.TRANSCRIBE, audioData);
  },

  removeAllListeners: (channel: MainToRendererChannel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
