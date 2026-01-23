import { contextBridge, ipcRenderer } from "electron";
import { IPC_INVOKE, IPC_RENDERER_TO_MAIN } from "./ipc/channels";
import type { PermissionsState } from "./permissions/service";
import type { AppSettings } from "./settings/schema";
import type { UpdateSettingsResult } from "./types/electron";

contextBridge.exposeInMainWorld("settingsAPI", {
  // Settings (invoke pattern)
  getSettings: (): Promise<AppSettings> => {
    return ipcRenderer.invoke(IPC_INVOKE.GET_SETTINGS);
  },
  updateSettings: (
    settings: Partial<AppSettings>,
  ): Promise<UpdateSettingsResult> => {
    return ipcRenderer.invoke(IPC_INVOKE.UPDATE_SETTINGS, settings);
  },
  // Shortcut capture
  startShortcutCapture: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_START);
  },
  endShortcutCapture: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.SHORTCUT_CAPTURE_END);
  },
  // Permissions
  checkPermissions: (): Promise<PermissionsState> => {
    return ipcRenderer.invoke(IPC_INVOKE.CHECK_PERMISSIONS);
  },
  requestMicrophonePermission: (): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_INVOKE.REQUEST_MICROPHONE_PERMISSION);
  },
  openAccessibilitySettings: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.OPEN_ACCESSIBILITY_SETTINGS);
  },
  openMicrophoneSettings: () => {
    ipcRenderer.send(IPC_RENDERER_TO_MAIN.OPEN_MICROPHONE_SETTINGS);
  },
});
