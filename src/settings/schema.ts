import { z } from "zod";

// Whisper モデル選択肢
export const WHISPER_MODELS = ["whisper-1"] as const;
export const WhisperModelSchema = z.enum(WHISPER_MODELS);
export type WhisperModel = z.infer<typeof WhisperModelSchema>;

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
export const GptModelSchema = z.enum(GPT_MODELS);
export type GptModel = z.infer<typeof GptModelSchema>;

// 丁寧さレベル選択肢
export const POLITENESS_LEVELS = [
  "weak",
  "medium",
  "strong",
  "strongest",
] as const;
export const PolitenessLevelSchema = z.enum(POLITENESS_LEVELS);
export type PolitenessLevel = z.infer<typeof PolitenessLevelSchema>;

// 丁寧さレベルの表示名
export const POLITENESS_LEVEL_LABELS: Record<PolitenessLevel, string> = {
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
  whisperModel: WhisperModelSchema,
  gptModel: GptModelSchema,
  politenessLevel: PolitenessLevelSchema,
  showWindowOnIdle: z.boolean(),
  showDockIcon: z.boolean(),
  globalShortcut: z.string(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: undefined,
  whisperModel: "whisper-1",
  gptModel: "gpt-4.1-mini",
  politenessLevel: "medium",
  showWindowOnIdle: true,
  showDockIcon: true,
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
export const OnboardingStepSchema = z.enum(ONBOARDING_STEPS);
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;

export const OnboardingStateSchema = z.object({
  currentStep: OnboardingStepSchema,
});
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  currentStep: "welcome",
};
