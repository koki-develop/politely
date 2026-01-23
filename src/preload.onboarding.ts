import { contextBridge, ipcRenderer } from "electron";
import { IPC_INVOKE, IPC_RENDERER_TO_MAIN } from "./ipc/channels";
import type { AppSettings, OnboardingState } from "./settings/schema";
import type { UpdateSettingsResult } from "./types/electron";

contextBridge.exposeInMainWorld("onboardingAPI", {
  // Onboarding state (invoke pattern)
  getOnboardingState: (): Promise<OnboardingState> => {
    return ipcRenderer.invoke(IPC_INVOKE.GET_ONBOARDING_STATE);
  },
  updateOnboardingState: (
    state: Partial<OnboardingState>,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    return ipcRenderer.invoke(IPC_INVOKE.UPDATE_ONBOARDING_STATE, state);
  },
  completeOnboarding: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_INVOKE.COMPLETE_ONBOARDING);
  },

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
});
