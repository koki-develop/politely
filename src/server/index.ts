import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";

const app = new Hono();

const openai = new OpenAI();

// CORS 設定（開発環境の Vite dev server からのリクエストを許可）
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  }),
);

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
