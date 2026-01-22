import { contextBridge, ipcRenderer } from "electron";
import { IPC_MAIN_TO_RENDERER, IPC_RENDERER_TO_MAIN } from "./ipc/channels";
import type { AppSettings } from "./settings/schema";

contextBridge.exposeInMainWorld("settingsAPI", {
  requestSettings: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.GET_SETTINGS);
  },
  updateSettings: (settings: Partial<AppSettings>) => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.UPDATE_SETTINGS, settings);
  },
  onSettingsData: (callback: (settings: AppSettings) => void) => {
    ipcRenderer.on(
      IPC_MAIN_TO_RENDERER.SETTINGS_DATA,
      (_event, settings: AppSettings) => callback(settings),
    );
  },
  onShortcutError: (callback: (error: string) => void) => {
    ipcRenderer.on(
      IPC_MAIN_TO_RENDERER.SHORTCUT_ERROR,
      (_event, error: string) => callback(error),
    );
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  startShortcutCapture: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_START);
  },
  endShortcutCapture: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_END);
  },
});
