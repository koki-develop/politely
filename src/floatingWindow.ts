import path from "node:path";
import { BrowserWindow, screen } from "electron";
import { FLOATING_WINDOW } from "./constants/ui";

let floatingWindow: BrowserWindow | null = null;

export function createFloatingWindow(preloadPath: string): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    return floatingWindow;
  }

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = FLOATING_WINDOW.DEFAULT_WIDTH;
  const windowHeight = FLOATING_WINDOW.DEFAULT_HEIGHT;
  const bottomMargin = FLOATING_WINDOW.BOTTOM_MARGIN;

  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = screenHeight - windowHeight - bottomMargin;

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
    type: "panel",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 全画面アプリの上に表示するための設定
  floatingWindow.setFullScreenable(false);
  floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  floatingWindow.setAlwaysOnTop(true, "screen-saver");

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
  floatingWindow?.showInactive();
}

export function hideFloatingWindow(): void {
  floatingWindow?.hide();
}

export function resizeFloatingWindow(width: number, height: number): void {
  if (!floatingWindow) return;

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((screenWidth - width) / 2);
  const y = screenHeight - height - FLOATING_WINDOW.BOTTOM_MARGIN;

  floatingWindow.setBounds({ x, y, width, height });
}

export function centerFloatingWindow(width: number, height: number): void {
  if (!floatingWindow) return;

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((screenWidth - width) / 2);
  const y = Math.floor((screenHeight - height) / 2);

  floatingWindow.setBounds({ x, y, width, height });
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
