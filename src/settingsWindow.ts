import path from "node:path";
import { BrowserWindow, screen } from "electron";

let settingsWindow: BrowserWindow | null = null;

export function createSettingsWindow(preloadPath: string): BrowserWindow {
  // 既存のウィンドウがあればフォーカス
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

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
    title: "Politely Settings",
    skipTaskbar: false,
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
    settingsWindow = null;
  });

  return settingsWindow;
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow;
}

export function destroySettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
    settingsWindow = null;
  }
}
