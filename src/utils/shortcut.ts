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
