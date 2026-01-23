/**
 * Electron のアクセラレータ形式をユーザー向け表示に変換
 * 例: "CommandOrControl+Shift+Space" → "⌘⇧Space"
 */
export function formatShortcut(accelerator: string): string {
  return accelerator
    .replace("CommandOrControl", "⌘")
    .replace("Command", "⌘")
    .replace("Shift", "⇧")
    .replace("Alt", "⌥")
    .replace("Option", "⌥")
    .replace("Control", "⌃")
    .replace(/\+/g, "");
}

/**
 * キーボードイベントを Electron のアクセラレータ形式に変換
 * 修飾キーのみの場合や無効なキーの場合は null を返す
 */
export function keyEventToAccelerator(event: KeyboardEvent): string | null {
  const modifiers: string[] = [];

  if (event.metaKey) modifiers.push("Command");
  if (event.ctrlKey) modifiers.push("Control");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");

  const key = event.key;
  const modifierKeys = ["Meta", "Control", "Alt", "Shift"];
  if (modifierKeys.includes(key)) return null;

  let electronKey = key;

  const keyMap: Record<string, string> = {
    " ": "Space",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    Escape: "Escape",
    Enter: "Return",
    Backspace: "Backspace",
    Delete: "Delete",
    Tab: "Tab",
  };

  if (keyMap[key]) {
    electronKey = keyMap[key];
  } else if (key.length === 1) {
    electronKey = key.toUpperCase();
  } else if (key.startsWith("F") && !Number.isNaN(Number(key.slice(1)))) {
    electronKey = key;
  } else {
    return null;
  }

  if (modifiers.length === 0) return null;

  return [...modifiers, electronKey].join("+");
}

/**
 * Electron のアクセラレータ形式を表示用にフォーマット
 * 例: "Command+Shift+Space" → "⌘ ⇧ Space"
 */
export function formatAcceleratorForDisplay(accelerator: string): string {
  return accelerator
    .replace(/Command/g, "⌘")
    .replace(/Control/g, "⌃")
    .replace(/Alt/g, "⌥")
    .replace(/Shift/g, "⇧")
    .replace(/\+/g, " ");
}
