import path from "node:path";
import { app, ipcMain, Menu, Tray } from "electron";
import started from "electron-squirrel-startup";
import {
  createFloatingWindow,
  destroyFloatingWindow,
  getFloatingWindow,
  hideFloatingWindow,
  resizeFloatingWindow,
  showFloatingWindow,
} from "./floatingWindow";
import {
  registerGlobalShortcut,
  unregisterAllShortcuts,
} from "./globalShortcut";
import { pasteText, savePreviousApp } from "./pasteService";
import { generateAuthToken, startServer, stopServer } from "./server";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

type AppState = "idle" | "recording" | "transcribing" | "error";
let appState: AppState = "idle";

let tray: Tray | null = null;

function createTray() {
  const iconPath = path.join(__dirname, "../../assets/trayIconTemplate.png");
  tray = new Tray(iconPath);
  tray.setToolTip("Politely - Voice Input");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Politely", enabled: false },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}

async function handleShortcutPress() {
  const floatingWindow = getFloatingWindow();
  if (!floatingWindow) return;

  switch (appState) {
    case "idle":
      await savePreviousApp();
      appState = "recording";
      showFloatingWindow();
      // ウィンドウ表示後、レンダラープロセスの準備完了を待ってから録音開始メッセージを送信
      setTimeout(() => {
        floatingWindow.webContents.send("start-recording");
      }, 100);
      break;

    case "recording":
      appState = "transcribing";
      floatingWindow.webContents.send("stop-recording");
      break;

    case "transcribing":
      // 文字起こし中は何もしない
      break;

    case "error":
      // エラー表示中はエラーをクリアして録音を開始
      await savePreviousApp();
      appState = "recording";
      // ウィンドウはすでに表示されているので、直接録音開始メッセージを送信
      floatingWindow.webContents.send("start-recording");
      break;
  }
}

function setupIpcHandlers() {
  ipcMain.on("transcription-complete", async (_event, text: string) => {
    console.log("[Main] Transcription complete:", text);

    hideFloatingWindow();
    appState = "idle";

    // ウィンドウが完全に閉じるのを待ってから、元アプリへのフォーカス切り替えとペーストを実行
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      await pasteText(text);
    } catch (error) {
      console.error("[Main] Failed to paste:", error);
    }
  });

  ipcMain.on("recording-cancelled", () => {
    console.log("[Main] Recording cancelled");
    hideFloatingWindow();
    appState = "idle";
  });

  ipcMain.on("recording-error", (_event, error: string) => {
    console.error("[Main] Recording error:", error);
    // エラー時はウィンドウを閉じず、エラー状態に遷移
    appState = "error";
  });

  ipcMain.on("error-dismissed", () => {
    console.log("[Main] Error dismissed");
    hideFloatingWindow();
    appState = "idle";
  });

  ipcMain.on("set-window-size", (_event, width: number, height: number) => {
    resizeFloatingWindow(width, height);
  });
}

app.on("ready", async () => {
  // macOS: Dock アイコンを隠す
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  const authToken = generateAuthToken();
  await startServer(3001);

  createTray();

  const preloadPath = path.join(__dirname, "preload.js");
  createFloatingWindow(preloadPath);

  // ウィンドウ読み込み完了後に認証トークンを送信
  getFloatingWindow()?.webContents.on("did-finish-load", () => {
    getFloatingWindow()?.webContents.send("auth-token", authToken);
  });

  setupIpcHandlers();

  registerGlobalShortcut(handleShortcutPress);
});

// トレイアプリなのでウィンドウが閉じても終了しない
app.on("window-all-closed", () => {
  // 何もしないことでアプリを終了させない
});

app.on("will-quit", () => {
  unregisterAllShortcuts();
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  destroyFloatingWindow();
  await stopServer();
  app.exit(0);
});
