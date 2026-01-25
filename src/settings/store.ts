import Store from "electron-store";
import {
  type AppSettings,
  AppSettingsSchema,
  DEFAULT_SETTINGS,
} from "./schema";

// electron-store のスキーマ定義
const schema = {
  apiKey: {
    type: "string" as const,
  },
  transcriptionModel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.transcriptionModel,
  },
  gptModel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.gptModel,
  },
  politenessLevel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.politenessLevel,
  },
  showWindowOnIdle: {
    type: "boolean" as const,
    default: DEFAULT_SETTINGS.showWindowOnIdle,
  },
  showDockIcon: {
    type: "boolean" as const,
    default: DEFAULT_SETTINGS.showDockIcon,
  },
  launchAtLogin: {
    type: "boolean" as const,
    default: DEFAULT_SETTINGS.launchAtLogin,
  },
  globalShortcut: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.globalShortcut,
  },
};

// シングルトンインスタンス
let store: Store<AppSettings> | null = null;

function getSettingsStore(): Store<AppSettings> {
  if (!store) {
    store = new Store<AppSettings>({
      name: "settings",
      schema,
      defaults: DEFAULT_SETTINGS,
    });
  }
  return store;
}

// 設定の取得ヘルパー
export function getSettings(): AppSettings {
  const s = getSettingsStore();
  const raw = {
    apiKey: s.get("apiKey"),
    transcriptionModel: s.get("transcriptionModel"),
    gptModel: s.get("gptModel"),
    politenessLevel: s.get("politenessLevel"),
    showWindowOnIdle: s.get("showWindowOnIdle"),
    showDockIcon: s.get("showDockIcon"),
    launchAtLogin: s.get("launchAtLogin"),
    globalShortcut: s.get("globalShortcut"),
  };

  const result = AppSettingsSchema.safeParse(raw);
  if (!result.success) {
    console.warn(
      "[Settings] Invalid stored settings, using defaults:",
      result.error.flatten(),
    );
    return DEFAULT_SETTINGS;
  }
  return result.data;
}

// 設定の更新ヘルパー
export function updateSettings(
  settings: Partial<AppSettings>,
): { success: true } | { success: false; error: string } {
  const result = AppSettingsSchema.partial().safeParse(settings);
  if (!result.success) {
    const error = JSON.stringify(result.error.format());
    console.error("[Settings] Invalid settings:", error);
    return { success: false, error };
  }

  const s = getSettingsStore();
  const validated = result.data;
  if ("apiKey" in validated) {
    if (validated.apiKey) {
      s.set("apiKey", validated.apiKey);
    } else {
      s.delete("apiKey");
    }
  }
  if (validated.transcriptionModel !== undefined) {
    s.set("transcriptionModel", validated.transcriptionModel);
  }
  if (validated.gptModel !== undefined) {
    s.set("gptModel", validated.gptModel);
  }
  if (validated.politenessLevel !== undefined) {
    s.set("politenessLevel", validated.politenessLevel);
  }
  if (validated.showWindowOnIdle !== undefined) {
    s.set("showWindowOnIdle", validated.showWindowOnIdle);
  }
  if (validated.showDockIcon !== undefined) {
    s.set("showDockIcon", validated.showDockIcon);
  }
  if (validated.launchAtLogin !== undefined) {
    s.set("launchAtLogin", validated.launchAtLogin);
  }
  if (validated.globalShortcut !== undefined) {
    s.set("globalShortcut", validated.globalShortcut);
  }

  return { success: true };
}
