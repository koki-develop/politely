import path from "node:path";
import { BrowserWindow, screen } from "electron";

declare const OVERLAY_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const OVERLAY_WINDOW_VITE_NAME: string;

let floatingWindow: BrowserWindow | null = null;

export function createFloatingWindow(preloadPath: string): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    return floatingWindow;
  }

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 200;
  const windowHeight = 80;

  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  floatingWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (OVERLAY_WINDOW_VITE_DEV_SERVER_URL) {
    floatingWindow.loadURL(
      `${OVERLAY_WINDOW_VITE_DEV_SERVER_URL}/overlay.html`,
    );
  } else {
    floatingWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${OVERLAY_WINDOW_VITE_NAME}/overlay.html`,
      ),
    );
  }

  floatingWindow.on("closed", () => {
    floatingWindow = null;
  });

  return floatingWindow;
}

export function showFloatingWindow(): void {
  floatingWindow?.show();
}

export function hideFloatingWindow(): void {
  floatingWindow?.hide();
}

export function destroyFloatingWindow(): void {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.close();
    floatingWindow = null;
  }
}

export function getFloatingWindow(): BrowserWindow | null {
  return floatingWindow;
}
