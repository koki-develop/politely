import type { AppState } from "../state/appState";
import type { MainToRendererChannel } from "../ipc/channels";
import type { PermissionsState } from "../permissions/service";
import type { AppSettings, OnboardingState } from "../settings/schema";
import type { ErrorCode } from "../errors/codes";

export type AppError = {
  code: ErrorCode;
  message: string;
};

export type StateChangePayload = {
  state: AppState;
  error: AppError | null;
  globalShortcut?: string;
};

type TranscribeSuccessResult = { success: true; text: string };
type TranscribeErrorResult = {
  success: false;
  error: string;
  errorCode: ErrorCode;
};
export type TranscribeResult = TranscribeSuccessResult | TranscribeErrorResult;

export interface ElectronAPI {
  // Main -> Renderer listeners
  onStartRecording: (callback: () => void) => void;
  onStopRecording: (callback: () => void) => void;
  onStateChanged: (callback: (payload: StateChangePayload) => void) => void;

  // Renderer -> Main senders
  sendTranscriptionComplete: (text: string) => void;
  sendRecordingCancelled: () => void;
  sendTranscribingCancelled: () => void;
  sendRecordingError: (error: AppError) => void;
  sendErrorDismissed: () => void;
  setWindowSize: (width: number, height: number) => void;
  centerWindow: (width: number, height: number) => void;
  openSettings: () => void;
  openAccessibilitySettings: () => void;
  openMicrophoneSettings: () => void;

  // Invoke (async with response)
  transcribe: (audioData: ArrayBuffer) => Promise<TranscribeResult>;

  // Cleanup
  removeAllListeners: (channel: MainToRendererChannel) => void;
}

export type UpdateSettingsResult =
  | { success: true; settings: AppSettings }
  | { success: false; error: string; settings: AppSettings };

export interface SettingsElectronAPI {
  // Settings (invoke pattern)
  getSettings: () => Promise<AppSettings>;
  updateSettings: (
    settings: Partial<AppSettings>,
  ) => Promise<UpdateSettingsResult>;
  // Shortcut capture
  startShortcutCapture: () => void;
  endShortcutCapture: () => void;
  // Permissions
  checkPermissions: () => Promise<PermissionsState>;
  requestMicrophonePermission: () => Promise<boolean>;
  requestAccessibilityPermission: () => Promise<boolean>;
  openAccessibilitySettings: () => void;
  openMicrophoneSettings: () => void;
}

export interface OnboardingElectronAPI {
  // Onboarding state (invoke pattern)
  getOnboardingState: () => Promise<OnboardingState>;
  updateOnboardingState: (
    state: Partial<OnboardingState>,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  completeOnboarding: () => Promise<void>;
  // Settings (invoke pattern)
  getSettings: () => Promise<AppSettings>;
  updateSettings: (
    settings: Partial<AppSettings>,
  ) => Promise<UpdateSettingsResult>;
  // Shortcut capture
  startShortcutCapture: () => void;
  endShortcutCapture: () => void;
  // Permissions
  checkPermissions: () => Promise<PermissionsState>;
  requestMicrophonePermission: () => Promise<boolean>;
  openMicrophoneSettings: () => void;
  openAccessibilitySettings: () => void;
  requestAccessibilityPermission: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    settingsAPI: SettingsElectronAPI;
    onboardingAPI: OnboardingElectronAPI;
  }
}
