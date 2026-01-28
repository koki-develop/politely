import path from "node:path";
import { BrowserWindow, screen } from "electron";
import { FLOATING_WINDOW, WINDOW_SIZES } from "./constants/ui";
import { type ErrorCode, isPermissionError } from "./errors/codes";
import type { AppState } from "./state/appState";

let floatingWindow: BrowserWindow | null = null;

function getActiveDisplayWorkArea(): Electron.Rectangle {
  return screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
}

export function createFloatingWindow(preloadPath: string): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    return floatingWindow;
  }

  const {
    x: displayX,
    y: displayY,
    width: screenWidth,
    height: screenHeight,
  } = getActiveDisplayWorkArea();

  const windowWidth = FLOATING_WINDOW.DEFAULT_WIDTH;
  const windowHeight = FLOATING_WINDOW.DEFAULT_HEIGHT;
  const bottomMargin = FLOATING_WINDOW.BOTTOM_MARGIN;

  const x = displayX + Math.floor((screenWidth - windowWidth) / 2);
  const y = displayY + screenHeight - windowHeight - bottomMargin;

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

  const {
    x: displayX,
    y: displayY,
    width: screenWidth,
    height: screenHeight,
  } = getActiveDisplayWorkArea();
  const x = displayX + Math.floor((screenWidth - width) / 2);
  const y = displayY + screenHeight - height - FLOATING_WINDOW.BOTTOM_MARGIN;

  floatingWindow.setBounds({ x, y, width, height });
}

export function centerFloatingWindow(width: number, height: number): void {
  if (!floatingWindow) return;

  const {
    x: displayX,
    y: displayY,
    width: screenWidth,
    height: screenHeight,
  } = getActiveDisplayWorkArea();
  const x = displayX + Math.floor((screenWidth - width) / 2);
  const y = displayY + Math.floor((screenHeight - height) / 2);

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

/**
 * 状態に応じたウィンドウサイズを取得
 */
function getWindowSizeForState(
  state: AppState,
  errorCode: ErrorCode | null,
): { width: number; height: number } {
  switch (state) {
    case "idle":
      return WINDOW_SIZES.IDLE;
    case "preparing":
      return WINDOW_SIZES.PREPARING;
    case "recording":
      return WINDOW_SIZES.RECORDING;
    case "transcribing":
      return WINDOW_SIZES.TRANSCRIBING;
    case "converting":
      return WINDOW_SIZES.CONVERTING;
    case "error": {
      const hasAction = errorCode ? isPermissionError(errorCode) : false;
      return hasAction ? WINDOW_SIZES.ERROR_WITH_ACTION : WINDOW_SIZES.ERROR;
    }
  }
}

/**
 * 状態に応じてウィンドウサイズを更新
 * Main Process の状態遷移時に同期的に呼び出される
 */
export function updateWindowSizeForState(
  state: AppState,
  errorCode: ErrorCode | null,
): void {
  const size = getWindowSizeForState(state, errorCode);

  if (state === "error") {
    centerFloatingWindow(size.width, size.height);
  } else {
    resizeFloatingWindow(size.width, size.height);
  }
}
