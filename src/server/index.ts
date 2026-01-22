import crypto from "node:crypto";
import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getSettings } from "../settings/store";

const app = new Hono();

const openai = new OpenAI();

let authToken: string | null = null;

// 丁寧語変換のレスポンススキーマ
const PoliteTextSchema = z.object({
  text: z.string().describe("丁寧語に変換されたテキスト"),
});

/**
 * テキストを丁寧語に変換する
 */
const convertToPolite = async (text: string): Promise<string> => {
  try {
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
    if (message?.parsed) {
      return message.parsed.text;
    }

    // パース失敗時はフォールバック
    return text;
  } catch (error) {
    console.error("[ConvertToPolite Error]", error);
    // エラー時は元のテキストを返す
    return text;
  }
};

export const generateAuthToken = (): string => {
  authToken = crypto.randomBytes(32).toString("hex");
  return authToken;
};

// CORS 設定（開発環境の Vite dev server からのリクエストを許可）
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (!origin) return origin;
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return origin;
      }
      return null;
    },
  }),
);

// トークン認証ミドルウェア
app.use("/api/*", async (c, next) => {
  const token = c.req.header("X-Auth-Token");
  if (!authToken || token !== authToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

// 音声文字起こしエンドポイント
app.post("/api/transcribe", async (c) => {
  try {
    const body = await c.req.parseBody();
    const audioFile = body.audio;

    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    // 1. 音声文字起こし
    const { whisperModel } = getSettings();
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: whisperModel,
      language: "ja",
    });
    console.log("[Transcribe] Original:", transcription.text);

    // 2. 丁寧語に変換
    const politeText = await convertToPolite(transcription.text);

    return c.json({ text: politeText });
  } catch (error) {
    console.error("[Transcribe Error]", error);

    if (error instanceof OpenAI.APIError) {
      return c.json(
        { error: `OpenAI API Error: ${error.message}` },
        error.status || 500,
      );
    }

    return c.json({ error: "Transcription failed" }, 500);
  }
});

let server: ServerType | null = null;

export const startServer = (port: number = 3001): Promise<void> => {
  return new Promise((resolve) => {
    server = serve(
      { fetch: app.fetch, port, hostname: "localhost" },
      (info) => {
        console.log(`[Hono] Server listening on http://localhost:${info.port}`);
        resolve();
      },
    );
  });
};

export const stopServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("[Hono] Server stopped");
          server = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};
