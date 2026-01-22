import Store from "electron-store";
import {
  type AppSettings,
  AppSettingsSchema,
  DEFAULT_SETTINGS,
} from "./schema";

// electron-store のスキーマ定義
const schema = {
  whisperModel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.whisperModel,
  },
  gptModel: {
    type: "string" as const,
    default: DEFAULT_SETTINGS.gptModel,
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
    whisperModel: s.get("whisperModel"),
    gptModel: s.get("gptModel"),
  };
}

// 設定の更新ヘルパー
export function updateSettings(settings: Partial<AppSettings>): void {
  const result = AppSettingsSchema.partial().safeParse(settings);
  if (!result.success) {
    console.warn("[Settings] Invalid settings:", result.error.format());
    return;
  }

  const s = getSettingsStore();
  const validated = result.data;
  if (validated.whisperModel !== undefined) {
    s.set("whisperModel", validated.whisperModel);
  }
  if (validated.gptModel !== undefined) {
    s.set("gptModel", validated.gptModel);
  }
}
