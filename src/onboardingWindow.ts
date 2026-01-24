import path from "node:path";
import { BrowserWindow, screen } from "electron";
import { completeOnboarding } from "./onboarding/store";

let onboardingWindow: BrowserWindow | null = null;
let onCloseCallback: (() => void) | null = null;
// アプリ終了処理中かどうか。closed イベントでコールバック呼び出しを防ぐために使用
let isQuitting = false;

export function createOnboardingWindow(
  preloadPath: string,
  onClose?: () => void,
): BrowserWindow {
  // 既存のウィンドウがあればフォーカス
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    onboardingWindow.focus();
    return onboardingWindow;
  }

  onCloseCallback = onClose ?? null;

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 520;
  const windowHeight = 560;

  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  onboardingWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    frame: true,
    transparent: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    title: "Politely",
    skipTaskbar: false,
    backgroundColor: "#18181b",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const loadContent = ONBOARDING_WINDOW_VITE_DEV_SERVER_URL
    ? onboardingWindow.loadURL(
        `${ONBOARDING_WINDOW_VITE_DEV_SERVER_URL}/onboarding.html`,
      )
    : onboardingWindow.loadFile(
        path.join(
          __dirname,
          `../renderer/${ONBOARDING_WINDOW_VITE_NAME}/onboarding.html`,
        ),
      );

  loadContent.catch((error) => {
    console.error("[OnboardingWindow] Failed to load content:", error);
  });

  onboardingWindow.on("ready-to-show", () => {
    onboardingWindow?.show();
  });

  onboardingWindow.on("closed", () => {
    // アプリ終了時はコールバックを呼ばない
    if (isQuitting) {
      onboardingWindow = null;
      onCloseCallback = null;
      return;
    }

    // ウィンドウを閉じたらオンボーディング完了扱い（途中で閉じた場合も含む）
    completeOnboarding();

    if (onCloseCallback) {
      onCloseCallback();
    }
    onboardingWindow = null;
    onCloseCallback = null;
  });

  return onboardingWindow;
}

export function destroyOnboardingWindow(): void {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    isQuitting = true;
    onboardingWindow.close();
    onboardingWindow = null;
  }
}
