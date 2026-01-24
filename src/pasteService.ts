import { exec } from "node:child_process";
import { promisify } from "node:util";
import { clipboard } from "electron";
import { TIMING } from "./constants/ui";
import { ERROR_CODES, ERROR_MESSAGES } from "./errors/codes";

/**
 * ペースト処理で発生するエラー
 */
export class PasteError extends Error {
  constructor(public readonly code: typeof ERROR_CODES.PASTE_FAILED) {
    super(ERROR_MESSAGES[code]);
    this.name = "PasteError";
  }
}

const execAsync = promisify(exec);

export async function pasteText(text: string): Promise<void> {
  clipboard.writeText(text);

  // クリップボードへの書き込みが OS に反映されるのを待つ
  await new Promise((resolve) =>
    setTimeout(resolve, TIMING.CLIPBOARD_WRITE_DELAY_MS),
  );

  if (process.platform === "darwin") {
    await simulatePaste();
  } else {
    console.warn("[PasteService] Only macOS is supported currently");
  }
}

async function simulatePaste(): Promise<void> {
  const script = `
    tell application "System Events"
      keystroke "v" using command down
    end tell
  `;

  try {
    await execAsync(`osascript -e '${script}'`);
    console.log("[PasteService] Paste simulated successfully");
  } catch (error) {
    console.error("[PasteService] Failed to simulate paste:", error);
    throw new PasteError(ERROR_CODES.PASTE_FAILED);
  }
}
