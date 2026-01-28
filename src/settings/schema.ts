import { z } from "zod";

// 文字起こしモデル選択肢
export const TRANSCRIPTION_MODELS = [
  "gpt-4o-transcribe",
  "gpt-4o-mini-transcribe",
  "whisper-1",
] as const;
const TranscriptionModelSchema = z.enum(TRANSCRIPTION_MODELS);
export type TranscriptionModel = z.infer<typeof TranscriptionModelSchema>;

// GPT モデル選択肢（gpt-5 系 / gpt-4.1 系）
export const GPT_MODELS = [
  // gpt-5 系
  "gpt-5.2",
  "gpt-5.1",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  // gpt-4.1 系
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
] as const;
const GptModelSchema = z.enum(GPT_MODELS);
export type GptModel = z.infer<typeof GptModelSchema>;

// 丁寧さレベル選択肢
export const POLITENESS_LEVELS = [
  "off",
  "weak",
  "medium",
  "strong",
  "strongest",
] as const;
const PolitenessLevelSchema = z.enum(POLITENESS_LEVELS);
export type PolitenessLevel = z.infer<typeof PolitenessLevelSchema>;

// 丁寧さレベルの表示名
export const POLITENESS_LEVEL_LABELS: Record<PolitenessLevel, string> = {
  off: "オフ",
  weak: "弱",
  medium: "中",
  strong: "強",
  strongest: "最強",
};

// デフォルトショートカット
export const DEFAULT_SHORTCUT = "Command+Shift+Space";

// 設定スキーマ
export const AppSettingsSchema = z.object({
  apiKey: z.string().optional(),
  transcriptionModel: TranscriptionModelSchema,
  gptModel: GptModelSchema,
  politenessLevel: PolitenessLevelSchema,
  showWindowOnIdle: z.boolean(),
  showDockIcon: z.boolean(),
  launchAtLogin: z.boolean(),
  globalShortcut: z.string(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: undefined,
  transcriptionModel: "gpt-4o-transcribe",
  gptModel: "gpt-4.1-mini",
  politenessLevel: "medium",
  showWindowOnIdle: true,
  showDockIcon: true,
  launchAtLogin: false,
  globalShortcut: DEFAULT_SHORTCUT,
};

// オンボーディングステップ
export const ONBOARDING_STEPS = [
  "welcome",
  "api-key",
  "microphone",
  "accessibility",
  "shortcut-key",
  "politeness-level",
  "completed",
] as const;
const OnboardingStepSchema = z.enum(ONBOARDING_STEPS);
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;

export const OnboardingStateSchema = z.object({
  currentStep: OnboardingStepSchema,
});
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  currentStep: "welcome",
};
