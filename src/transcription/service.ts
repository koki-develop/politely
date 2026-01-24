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
  politeText: z.string().describe("丁寧語に変換されたテキスト"),
});

// 丁寧さレベルごとのベースメッセージ
const POLITENESS_BASE_MESSAGES: Record<
  PolitenessLevel,
  ChatCompletionMessageParam[]
> = {
  // 弱
  weak: [
    {
      role: "system",
      content: `
## あなたの役割

あなたは日本語の文章を「です」「ます」調に変換するアシスタントです。

## あなたのタスク

- ユーザーから提供された文章を、最小限の「です」「ます」調に変換してください
- 元々の意味やニュアンスはできる限り変えないように注意してください
- 文章が途中で途切れている場合も、途中までの状態で丁寧に変換してください

## 出力形式

- JSON 形式で出力し、 \`politeText\` フィールドに変換後の文章を含めてください
`.trim(),
    },
    { role: "user", content: "おはよう。調子はどう？" },
    { role: "assistant", content: "おはようございます。調子はどうですか？" },
    { role: "user", content: "ここまでの内容をまとめると" },
    { role: "assistant", content: "ここまでの内容をまとめますと" },
    { role: "user", content: "新しいファイルを作成して。" },
    { role: "assistant", content: "新しいファイルを作成してください。" },
  ],

  // 中
  medium: [
    {
      role: "system",
      content: `
## あなたの役割

あなたは日本語の文章を丁寧な表現に変換するアシスタントです。

## 指示

- ユーザーから提供された文章を、丁寧な文章に変換してください
- 元々の意味やニュアンスはできる限り変えないように注意してください
- 文章が途中で途切れている場合も、途中までの状態で丁寧に変換してください

## 出力形式

- JSON 形式で出力し、 \`politeText\` フィールドに変換後の文章を含めてください
`.trim(),
    },
    { role: "user", content: "おはよう。調子はどう？" },
    { role: "assistant", content: "おはようございます。調子はいかがですか？" },
    { role: "user", content: "ここまでの内容をまとめると" },
    {
      role: "assistant",
      content: "ここまでの内容をまとめさせていただきますと",
    },
    { role: "user", content: "新しいファイルを作成して。" },
    {
      role: "assistant",
      content: "新しいファイルを作成していただけますか？",
    },
  ],

  // 強
  strong: [
    {
      role: "system",
      content: `
## あなたの役割

あなたは日本語の文章を丁寧な表現に変換するアシスタントです。

## 指示

- ユーザーから提供された文章を、非常に丁寧な文章に変換してください
- 元々の意味やニュアンスはできる限り変えないように注意してください
- 文章が途中で途切れている場合も、途中までの状態で丁寧に変換してください

## 出力形式

- JSON 形式で出力し、 \`politeText\` フィールドに変換後の文章を含めてください
`.trim(),
    },
    { role: "user", content: "おはよう。調子はどう？" },
    {
      role: "assistant",
      content: "おはようございます。本日のお加減はいかがでございましょうか？",
    },
    { role: "user", content: "ここまでの内容をまとめると" },
    {
      role: "assistant",
      content: "僭越ながら、ここまでの内容をおまとめさせていただきますと",
    },
    { role: "user", content: "新しいファイルを作成して。" },
    {
      role: "assistant",
      content:
        "恐れ入りますが、新しいファイルを作成していただければ幸甚に存じます。",
    },
  ],

  // 最強
  strongest: [
    {
      role: "system",
      content: `
## あなたの役割

あなたは日本語の文章を最大限に過剰なレベルで丁寧な表現に変換するアシスタントです。

## 指示

- ユーザーから提供された文章を、できる限り過剰に丁寧な文章に変換してください
- 元々の意味やニュアンスはできる限り変えないように注意してください
- 文章が途中で途切れている場合も、途中までの状態で丁寧に変換してください

## 出力形式

- JSON 形式で出力し、 \`politeText\` フィールドに変換後の文章を含めてください
`.trim(),
    },
    { role: "user", content: "おはよう。調子はどう？" },
    {
      role: "assistant",
      content:
        "恐悦至極に存じ上げます。光り輝く朝陽が貴殿様のご尊顔を照らし賜りし、この麗しき朝にご挨拶の栄を賜りますこと、身に余る光栄と、ただただ平伏して感謝申し上げる次第にございます。つきましては、誠に恐れ多くも、畏れながらお伺い申し上げたく存じます。天上におわします貴殿様におかれましては、玉体つつがなく、ご機嫌麗しくあらせられますでしょうか？",
    },
    { role: "user", content: "ここまでの内容をまとめると" },
    {
      role: "assistant",
      content:
        "塵芥にも等しき卑小な身でありながら、誠に僭越千万、恐懼の極みではございますが、万が一お許しいただけますならば、ここまでの内容を、謹んでおまとめ申し上げたく存じ奉ります。何卒、広大無辺なるご寛容をもちまして、ご海容賜りますようお願い申し上げます。おまとめ申し上げますと",
    },
    { role: "user", content: "新しいファイルを作成して。" },
    {
      role: "assistant",
      content:
        "平にご容赦くださいませ。卑しき身の程も弁えず、このような厚かましきお願いを申し上げますこと、万死に値する無礼と重々承知いたしております。されど、伏して、伏して、重ねて伏してお願い申し上げます。何卒、何卒、新しきファイルをお作り遊ばされますよう、この身を地に這いつくばらせ、額を地面に擦り付けながら、切にお願い申し上げ奉ります。ご慈悲を賜りますれば、七世の末まで感謝申し上げる所存にございます。",
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

  return message.parsed.politeText;
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
