import crypto from "node:crypto";
import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";

const app = new Hono();

const openai = new OpenAI();

let authToken: string | null = null;

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

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ja",
    });

    return c.json({ text: transcription.text });
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
