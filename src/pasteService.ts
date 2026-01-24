import { clipboard } from "electron";
import { TIMING } from "./constants/ui";
import { ERROR_CODES, ERROR_MESSAGES } from "./errors/codes";
import { simulateCommandV } from "./native/keySimulator";

/**
 * ペースト処理で発生するエラー
 */
export class PasteError extends Error {
  constructor(public readonly code: typeof ERROR_CODES.PASTE_FAILED) {
    super(ERROR_MESSAGES[code]);
    this.name = "PasteError";
  }
}

export async function pasteText(text: string): Promise<void> {
  clipboard.writeText(text);

  // クリップボードへの書き込みが OS に反映されるのを待つ
  await new Promise((resolve) =>
    setTimeout(resolve, TIMING.CLIPBOARD_WRITE_DELAY_MS),
  );

  simulatePaste();
}

function simulatePaste(): void {
  try {
    simulateCommandV();
    console.log(
      "[PasteService] Paste simulated successfully via Core Graphics",
    );
  } catch (error) {
    console.error("[PasteService] Failed to simulate paste:", error);
    throw new PasteError(ERROR_CODES.PASTE_FAILED);
  }
}
