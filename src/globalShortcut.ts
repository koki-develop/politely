import { globalShortcut } from "electron";

type ShortcutCallback = () => void;

const SHORTCUT_ACCELERATOR = "Command+Shift+Space";

let isRegistered = false;

export function registerGlobalShortcut(callback: ShortcutCallback): boolean {
  if (isRegistered) {
    return true;
  }

  const success = globalShortcut.register(SHORTCUT_ACCELERATOR, callback);

  if (success) {
    isRegistered = true;
    console.log(`[GlobalShortcut] Registered: ${SHORTCUT_ACCELERATOR}`);
  } else {
    console.error(
      `[GlobalShortcut] Failed to register: ${SHORTCUT_ACCELERATOR}`,
    );
  }

  return success;
}

export function unregisterGlobalShortcut(): void {
  if (isRegistered) {
    globalShortcut.unregister(SHORTCUT_ACCELERATOR);
    isRegistered = false;
    console.log(`[GlobalShortcut] Unregistered: ${SHORTCUT_ACCELERATOR}`);
  }
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll();
  isRegistered = false;
  console.log("[GlobalShortcut] Unregistered all shortcuts");
}
