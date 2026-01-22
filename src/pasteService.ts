import { exec } from "node:child_process";
import { promisify } from "node:util";
import { clipboard } from "electron";

const execAsync = promisify(exec);

let previousApp: string | null = null;
let trackingInterval: ReturnType<typeof setInterval> | null = null;
const TRACKING_INTERVAL_MS = 500;

// フローティングウィンドウのアプリ名（自分自身を除外するため）
const EXCLUDED_APP_NAMES = ["politely", "electron"];

/**
 * アクティブアプリのリアルタイムトラッキングを開始
 * 500ms間隔でフォアグラウンドアプリを監視し、previousApp を更新する
 */
export function startActiveAppTracking(): void {
  if (trackingInterval) return;

  trackingInterval = setInterval(() => {
    updateActiveApp();
  }, TRACKING_INTERVAL_MS);

  // 初回即実行
  updateActiveApp();
  console.log("[PasteService] Active app tracking started");
}

/**
 * アクティブアプリのトラッキングを停止
 */
export function stopActiveAppTracking(): void {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
    console.log("[PasteService] Active app tracking stopped");
  }
}

/**
 * 現在のアクティブアプリを取得して previousApp を更新
 */
async function updateActiveApp(): Promise<void> {
  if (process.platform === "darwin") {
    try {
      const script = `
        tell application "System Events"
          set frontApp to name of first application process whose frontmost is true
        end tell
        return frontApp
      `;
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      const appName = stdout.trim();

      // 自分自身や Electron 以外のアプリのみ記録
      if (appName && !EXCLUDED_APP_NAMES.includes(appName.toLowerCase())) {
        previousApp = appName;
      }
    } catch {
      // ポーリングなのでエラーは静かに無視
    }
  }
}

/**
 * @deprecated トラッキング中は no-op。後方互換性のために残す。
 */
export async function savePreviousApp(): Promise<void> {
  // トラッキング中は既に最新の情報を持っているのでスキップ
  if (trackingInterval) {
    return;
  }
  // フォールバック: トラッキングが無効な場合は従来通り取得
  await updateActiveApp();
  console.log("[PasteService] Saved previous app (fallback):", previousApp);
}

export async function pasteText(text: string): Promise<void> {
  clipboard.writeText(text);

  // クリップボードへの書き込みが OS に反映されるのを待つ
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (process.platform === "darwin") {
    await activatePreviousAppAndPaste();
  } else {
    console.warn("[PasteService] Only macOS is supported currently");
  }
}

function escapeAppleScriptString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function activatePreviousAppAndPaste(): Promise<void> {
  if (!previousApp) {
    console.warn("[PasteService] No previous app saved, skipping paste");
    return;
  }

  const sanitizedApp = escapeAppleScriptString(previousApp);
  const script = `
    tell application "${sanitizedApp}"
      activate
    end tell
    delay 0.1
    tell application "System Events"
      keystroke "v" using command down
    end tell
  `;

  try {
    await execAsync(`osascript -e '${script}'`);
    console.log("[PasteService] Paste simulated successfully");
  } catch (error) {
    console.error("[PasteService] Failed to simulate paste:", error);
    throw new Error(
      "Failed to paste. Please ensure Politely has Accessibility permissions in System Preferences > Security & Privacy > Privacy > Accessibility",
    );
  }
}
