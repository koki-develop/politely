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

// 設定スキーマ
export const AppSettingsSchema = z.object({
  apiKey: z.string().optional(),
  whisperModel: WhisperModelSchema,
  gptModel: GptModelSchema,
  showWindowOnIdle: z.boolean(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: undefined,
  whisperModel: "whisper-1",
  gptModel: "gpt-4.1-mini",
  showWindowOnIdle: true,
};
