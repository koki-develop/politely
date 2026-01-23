import path from "node:path";
import { BrowserWindow, screen } from "electron";

let settingsWindow: BrowserWindow | null = null;
let onCloseCallback: (() => void) | null = null;

export function createSettingsWindow(
  preloadPath: string,
  onClose?: () => void,
): BrowserWindow {
  // 既存のウィンドウがあればフォーカス
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  onCloseCallback = onClose ?? null;

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 480;
  const windowHeight = 400;
  const minWidth = 400;
  const minHeight = 300;

  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  settingsWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth,
    minHeight,
    x,
    y,
    frame: true,
    transparent: false,
    resizable: true,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    show: false,
    title: "Settings",
    skipTaskbar: false,
    backgroundColor: "#18181b",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (SETTINGS_WINDOW_VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(
      `${SETTINGS_WINDOW_VITE_DEV_SERVER_URL}/settings.html`,
    );
  } else {
    settingsWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${SETTINGS_WINDOW_VITE_NAME}/settings.html`,
      ),
    );
  }

  settingsWindow.on("ready-to-show", () => {
    settingsWindow?.show();
  });

  settingsWindow.on("closed", () => {
    // キャプチャモード中にウィンドウを閉じた場合のためにコールバックを呼び出す
    if (onCloseCallback) {
      onCloseCallback();
    }
    settingsWindow = null;
    onCloseCallback = null;
  });

  return settingsWindow;
}

export function destroySettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
    settingsWindow = null;
  }
}
