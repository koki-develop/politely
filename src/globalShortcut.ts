import { globalShortcut } from "electron";

export type ShortcutCallback = () => void;

let currentAccelerator: string | null = null;
let currentCallback: ShortcutCallback | null = null;

export function registerGlobalShortcut(
  accelerator: string,
  callback: ShortcutCallback,
): { success: true } | { success: false; error: string } {
  // 既存のショートカットを解除
  if (currentAccelerator) {
    globalShortcut.unregister(currentAccelerator);
  }

  const success = globalShortcut.register(accelerator, callback);

  if (success) {
    currentAccelerator = accelerator;
    currentCallback = callback;
    console.log(`[GlobalShortcut] Registered: ${accelerator}`);
    return { success: true };
  }

  // 登録失敗時は元のショートカットを復元
  if (currentAccelerator && currentCallback) {
    globalShortcut.register(currentAccelerator, currentCallback);
    console.log(`[GlobalShortcut] Restored: ${currentAccelerator}`);
  }

  console.error(`[GlobalShortcut] Failed to register: ${accelerator}`);
  return {
    success: false,
    error: `ショートカット "${accelerator}" の登録に失敗しました。他のアプリが使用している可能性があります。`,
  };
}

export function getCurrentAccelerator(): string | null {
  return currentAccelerator;
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll();
  currentAccelerator = null;
  currentCallback = null;
  console.log("[GlobalShortcut] Unregistered all shortcuts");
}
