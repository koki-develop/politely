import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getSettings } from "../settings/store";
import type { TranscribeResult } from "../types/electron";

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({ apiKey });
}

export function resetOpenAI(): void {
  openaiClient = null;
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    throw new Error("API_KEY_NOT_CONFIGURED");
  }
  return openaiClient;
}

const PoliteTextSchema = z.object({
  text: z.string().describe("丁寧語に変換されたテキスト"),
});

const convertToPolite = async (text: string): Promise<string> => {
  const openai = getOpenAI();
  const { gptModel } = getSettings();
  const completion = await openai.chat.completions.parse({
    model: gptModel,
    messages: [
      {
        role: "system",
        content:
          "あなたは日本語のテキストを丁寧語に変換するアシスタントです。入力されたテキストを「です」「ます」調の丁寧語に変換してください。意味や内容は変えず、語調のみを丁寧にしてください。",
      },
      {
        role: "user",
        content: text,
      },
    ],
    response_format: zodResponseFormat(PoliteTextSchema, "polite_text"),
  });

  const message = completion.choices[0]?.message;

  if (message?.refusal) {
    throw new Error(`Model refused: ${message.refusal}`);
  }

  if (!message?.parsed) {
    throw new Error("Failed to parse polite text response");
  }

  return message.parsed.text;
};

export async function transcribe(
  audioData: ArrayBuffer,
): Promise<TranscribeResult> {
  try {
    const openai = getOpenAI();
    const { whisperModel } = getSettings();

    const buffer = Buffer.from(audioData);
    const file = new File([buffer], "recording.webm", { type: "audio/webm" });

    // 1. 音声文字起こし
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: whisperModel,
      language: "ja",
    });
    console.log("[Transcribe] Original:", transcription.text);

    // 2. 丁寧語に変換
    const politeText = await convertToPolite(transcription.text);

    return { success: true, text: politeText };
  } catch (error) {
    console.error("[Transcribe Error]", error);

    if (error instanceof Error && error.message === "API_KEY_NOT_CONFIGURED") {
      return {
        success: false,
        error: "API key not configured",
        errorCode: "API_KEY_NOT_CONFIGURED",
      };
    }

    if (error instanceof OpenAI.APIError) {
      return {
        success: false,
        error: `OpenAI API Error: ${error.message}`,
      };
    }

    return { success: false, error: "Transcription failed" };
  }
}
