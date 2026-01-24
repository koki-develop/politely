import path from "node:path";
import { app, Menu, Tray } from "electron";
import { getSettings } from "./settings/store";
import type { AppState } from "./state/appState";

let tray: Tray | null = null;
let openSettingsWindowFn: (() => void) | null = null;
let handleShortcutPressFn: (() => Promise<void>) | null = null;

export function createTray(
  openSettingsWindow: () => void,
  handleShortcutPress: () => Promise<void>,
): Tray {
  if (tray && !tray.isDestroyed()) return tray;

  openSettingsWindowFn = openSettingsWindow;
  handleShortcutPressFn = handleShortcutPress;

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "trayIconTemplate.png")
    : path.join(__dirname, "../../assets/trayIconTemplate.png");

  tray = new Tray(iconPath);
  tray.setToolTip("Politely - Voice Input");

  // Set initial menu for idle state
  updateTrayMenu("idle");

  return tray;
}

export function updateTrayMenu(state: AppState): void {
  if (!tray || tray.isDestroyed()) return;

  const settings = getSettings();
  const menuTemplate = buildMenuTemplate(state, settings.globalShortcut);

  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
}

/**
 * Create a click handler that properly handles async errors
 */
function createRecordingClickHandler(): () => void {
  return () => {
    handleShortcutPressFn?.().catch((error) => {
      console.error("[TrayMenu] Failed to handle shortcut press:", error);
    });
  };
}

function buildMenuTemplate(
  state: AppState,
  accelerator: string,
): Electron.MenuItemConstructorOptions[] {
  const isRecording = state === "recording";
  const isBusy = state === "preparing" || state === "transcribing";
  const canOperate = state === "idle" || state === "error";

  // Recording item configuration
  let recordingLabel: string;
  let recordingEnabled: boolean;
  let recordingClick: (() => void) | undefined;

  if (isRecording) {
    recordingLabel = "Stop Recording";
    recordingEnabled = true;
    recordingClick = createRecordingClickHandler();
  } else if (isBusy) {
    recordingLabel = state === "preparing" ? "Preparing..." : "Processing...";
    recordingEnabled = false;
  } else {
    // idle or error
    recordingLabel = "Start Recording";
    recordingEnabled = true;
    recordingClick = createRecordingClickHandler();
  }

  // Settings enabled only when idle or error
  const settingsEnabled = canOperate;

  return [
    { label: `Politely v${app.getVersion()}`, enabled: false },
    {
      label: "Settings...",
      accelerator: "Command+,",
      enabled: settingsEnabled,
      click: () => openSettingsWindowFn?.(),
    },
    { type: "separator" },
    {
      label: recordingLabel,
      accelerator,
      enabled: recordingEnabled,
      click: recordingClick,
    },
    { type: "separator" },
    { label: "Quit", accelerator: "Command+Q", click: () => app.quit() },
  ];
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
  openSettingsWindowFn = null;
  handleShortcutPressFn = null;
}
