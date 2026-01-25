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
  rawText?: string | null;
  globalShortcut?: string;
};

// 音声文字起こしの結果型
type TranscribeAudioSuccessResult = { success: true; text: string };
type TranscribeAudioErrorResult = {
  success: false;
  error: string;
  errorCode: ErrorCode;
};
export type TranscribeAudioResult =
  | TranscribeAudioSuccessResult
  | TranscribeAudioErrorResult;

// 丁寧語変換の結果型
type ConvertToPoliteSuccessResult = { success: true; text: string };
type ConvertToPoliteErrorResult = {
  success: false;
  error: string;
  errorCode: ErrorCode;
};
export type ConvertToPoliteResult =
  | ConvertToPoliteSuccessResult
  | ConvertToPoliteErrorResult;

export interface ElectronAPI {
  // Main -> Renderer listeners
  onStartRecording: (callback: () => void) => void;
  onStopRecording: (callback: () => void) => void;
  onStateChanged: (callback: (payload: StateChangePayload) => void) => void;

  // Renderer -> Main senders
  sendRecordingStarted: () => void;
  sendTranscriptionComplete: (text: string) => void;
  sendTranscriptionProgress: (rawText: string) => void;
  sendRecordingCancelled: () => void;
  sendTranscribingCancelled: () => void;
  sendConvertingCancelled: () => void;
  sendRecordingError: (error: AppError) => void;
  sendErrorDismissed: () => void;
  setWindowSize: (width: number, height: number) => void;
  centerWindow: (width: number, height: number) => void;
  openSettings: () => void;
  openAccessibilitySettings: () => void;
  openMicrophoneSettings: () => void;

  // Invoke (async with response)
  transcribeAudio: (audioData: ArrayBuffer) => Promise<TranscribeAudioResult>;
  convertToPolite: (text: string) => Promise<ConvertToPoliteResult>;

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
