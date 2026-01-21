import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// CORS 設定（開発環境の Vite dev server からのリクエストを許可）
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  }),
);

// Health check エンドポイント
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
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
