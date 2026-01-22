import { exec } from "node:child_process";
import { promisify } from "node:util";
import { clipboard } from "electron";

const execAsync = promisify(exec);

let previousApp: string | null = null;

export async function savePreviousApp(): Promise<void> {
  if (process.platform === "darwin") {
    try {
      const script = `
        tell application "System Events"
          set frontApp to name of first application process whose frontmost is true
        end tell
        return frontApp
      `;
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      previousApp = stdout.trim();
      console.log("[PasteService] Saved previous app:", previousApp);
    } catch (error) {
      console.error("[PasteService] Failed to save previous app:", error);
      previousApp = null;
    }
  }
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
