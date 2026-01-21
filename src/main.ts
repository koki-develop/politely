import path from "node:path";
import { app, ipcMain, Menu, Tray } from "electron";
import started from "electron-squirrel-startup";
import {
  createFloatingWindow,
  destroyFloatingWindow,
  getFloatingWindow,
  hideFloatingWindow,
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

let isRecording = false;

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

  if (!isRecording) {
    await savePreviousApp();
    isRecording = true;
    showFloatingWindow();
    // ウィンドウ表示後、レンダラープロセスの準備完了を待ってから録音開始メッセージを送信
    setTimeout(() => {
      floatingWindow.webContents.send("start-recording");
    }, 100);
  } else {
    isRecording = false;
    floatingWindow.webContents.send("stop-recording");
  }
}

function setupIpcHandlers() {
  ipcMain.on("transcription-complete", async (_event, text: string) => {
    console.log("[Main] Transcription complete:", text);

    hideFloatingWindow();
    isRecording = false;

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
    isRecording = false;
  });

  ipcMain.on("recording-error", (_event, error: string) => {
    console.error("[Main] Recording error:", error);
    hideFloatingWindow();
    isRecording = false;
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
app.on("window-all-closed", (e: Event) => {
  e.preventDefault();
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
