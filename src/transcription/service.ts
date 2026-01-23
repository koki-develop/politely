import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";
import { ERROR_CODES } from "../errors/codes";
import type { PolitenessLevel } from "../settings/schema";
import { getSettings } from "../settings/store";
import type { TranscribeResult } from "../types/electron";

let openaiClient: OpenAI | null = null;
let currentAbortController: AbortController | null = null;

export function initializeOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({ apiKey });
}

export function resetOpenAI(): void {
  openaiClient = null;
}

export function abortTranscription(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
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

// 丁寧さレベルごとのベースメッセージ
const POLITENESS_BASE_MESSAGES: Record<
  PolitenessLevel,
  ChatCompletionMessageParam[]
> = {
  weak: [
    {
      role: "system",
      content: `あなたは日本語のテキストを丁寧語に変換するアシスタントです。
入力されたテキストを最小限の「です」「ます」調に変換してください。
文末のみを「です」「ます」に変え、それ以外の表現は変えないでください。
意味や内容は変えず、語調のみを丁寧にしてください。`,
    },
  ],
  medium: [
    {
      role: "system",
      content: `あなたは日本語のテキストを丁寧語に変換するアシスタントです。
入力されたテキストを「です」「ます」調の丁寧語に変換してください。
意味や内容は変えず、語調のみを丁寧にしてください。`,
    },
  ],
  strong: [
    {
      role: "system",
      content: `あなたは日本語のテキストをより丁寧な表現に変換するアシスタントです。
入力されたテキストを丁寧な「です」「ます」調に変換し、適切な箇所では「ございます」「いたします」などのより丁寧な表現を使用してください。
相手への配慮を示す表現（「恐れ入りますが」「お手数ですが」など）を適宜追加してください。
意味や内容は変えず、語調をより丁寧にしてください。`,
    },
  ],
  strongest: [
    {
      role: "system",
      content: `あなたは日本語のテキストを最も丁寧な敬語表現に変換するアシスタントです。
入力されたテキストを最高レベルの敬語に変換してください。
以下のルールに従ってください：
- 謙譲語を積極的に使用（「申し上げる」「いたす」「存じる」など）
- 尊敬語を適切に使用（「いらっしゃる」「おっしゃる」「ご覧になる」など）
- 丁重語・美化語を使用（「お」「ご」の接頭辞、「ございます」など）
- クッション言葉を追加（「恐れ入りますが」「誠に恐縮ですが」「お手数をおかけしますが」など）
意味や内容は変えず、可能な限り丁寧な表現にしてください。`,
    },
  ],
};

const convertToPolite = async (
  text: string,
  signal?: AbortSignal,
): Promise<string> => {
  const openai = getOpenAI();
  const { gptModel, politenessLevel } = getSettings();
  const baseMessages = POLITENESS_BASE_MESSAGES[politenessLevel];
  const completion = await openai.chat.completions.parse(
    {
      model: gptModel,
      messages: [
        ...baseMessages,
        {
          role: "user",
          content: text,
        },
      ],
      response_format: zodResponseFormat(PoliteTextSchema, "polite_text"),
    },
    { signal },
  );

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
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    const openai = getOpenAI();
    const { whisperModel } = getSettings();

    const buffer = Buffer.from(audioData);
    const file = new File([buffer], "recording.webm", { type: "audio/webm" });

    // 1. 音声文字起こし
    const transcription = await openai.audio.transcriptions.create(
      {
        file,
        model: whisperModel,
        language: "ja",
      },
      { signal },
    );
    console.log("[Transcribe] Original:", transcription.text);

    // 2. 丁寧語に変換
    const politeText = await convertToPolite(transcription.text, signal);

    return { success: true, text: politeText };
  } catch (error) {
    console.error("[Transcribe Error]", error);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        error: "Transcription cancelled",
        errorCode: ERROR_CODES.TRANSCRIPTION_CANCELLED,
      };
    }

    if (error instanceof Error && error.message === "API_KEY_NOT_CONFIGURED") {
      return {
        success: false,
        error: "API key not configured",
        errorCode: ERROR_CODES.API_KEY_NOT_CONFIGURED,
      };
    }

    if (error instanceof OpenAI.APIError) {
      return {
        success: false,
        error: `OpenAI API Error: ${error.message}`,
        errorCode: ERROR_CODES.TRANSCRIPTION_FAILED,
      };
    }

    return {
      success: false,
      error: "Transcription failed",
      errorCode: ERROR_CODES.TRANSCRIPTION_FAILED,
    };
  } finally {
    currentAbortController = null;
  }
}
