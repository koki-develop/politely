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
  whisperModel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.whisperModel,
  },
  gptModel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.gptModel,
  },
  showWindowOnIdle: {
    type: "boolean" as const,
    default: DEFAULT_SETTINGS.showWindowOnIdle,
  },
};

// シングルトンインスタンス
let store: Store<AppSettings> | null = null;

export function getSettingsStore(): Store<AppSettings> {
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
  return {
    apiKey: s.get("apiKey"),
    whisperModel: s.get("whisperModel"),
    gptModel: s.get("gptModel"),
    showWindowOnIdle: s.get("showWindowOnIdle"),
  };
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
  if (validated.whisperModel !== undefined) {
    s.set("whisperModel", validated.whisperModel);
  }
  if (validated.gptModel !== undefined) {
    s.set("gptModel", validated.gptModel);
  }
  if (validated.showWindowOnIdle !== undefined) {
    s.set("showWindowOnIdle", validated.showWindowOnIdle);
  }

  return { success: true };
}
