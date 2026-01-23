import { useCallback, useEffect, useState } from "react";
import type { PermissionsState } from "../permissions/service";
import {
  type AppSettings,
  DEFAULT_SHORTCUT,
  GPT_MODELS,
  type GptModel,
  WHISPER_MODELS,
  type WhisperModel,
} from "../settings/schema";
import { ApiKeyInput } from "./ApiKeyInput";
import { ModelSelector } from "./ModelSelector";
import { PermissionStatus } from "./PermissionStatus";
import { ShortcutInput } from "./ShortcutInput";
import { ToggleSwitch } from "./ToggleSwitch";

export const SettingsApp = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionsState | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await window.settingsAPI.getSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  // 権限状態をチェック（2秒間隔でポーリング）
  useEffect(() => {
    const checkPermissions = async () => {
      const perms = await window.settingsAPI.checkPermissions();
      setPermissions(perms);
    };

    checkPermissions();

    const interval = setInterval(checkPermissions, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleWhisperModelChange = useCallback(async (model: WhisperModel) => {
    const result = await window.settingsAPI.updateSettings({
      whisperModel: model,
    });
    if (result.success) {
      setSettings(result.settings);
    }
  }, []);

  const handleGptModelChange = useCallback(async (model: GptModel) => {
    const result = await window.settingsAPI.updateSettings({ gptModel: model });
    if (result.success) {
      setSettings(result.settings);
    }
  }, []);

  const handleApiKeyChange = useCallback(async (apiKey: string) => {
    const result = await window.settingsAPI.updateSettings({ apiKey });
    if (result.success) {
      setSettings(result.settings);
    }
  }, []);

  const handleShowWindowOnIdleChange = useCallback(async (checked: boolean) => {
    const result = await window.settingsAPI.updateSettings({
      showWindowOnIdle: checked,
    });
    if (result.success) {
      setSettings(result.settings);
    }
  }, []);

  const handleShortcutChange = useCallback(async (shortcut: string) => {
    setShortcutError(null);
    const result = await window.settingsAPI.updateSettings({
      globalShortcut: shortcut,
    });
    if (!result.success) {
      setShortcutError(result.error);
    }
    setSettings(result.settings);
  }, []);

  if (!settings) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 text-[13px]">
          <div className="w-3 h-3 border-2 border-zinc-600 border-t-violet-500 rounded-full animate-spin" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col select-none">
      {/* Titlebar drag region */}
      <div className="h-7 flex-shrink-0 [-webkit-app-region:drag]" />

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {/* API Key Section */}
        <div className="mb-6">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-[-0.02em]">
            API キー
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            認証用の OpenAI API キーを設定します
          </p>
        </div>

        <div className="space-y-5 mb-8">
          {/* API Key */}
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ApiKeyInput
              value={settings.apiKey ?? ""}
              onChange={handleApiKeyChange}
            />
          </div>
        </div>

        {/* Models Section */}
        <div className="mb-6">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-[-0.02em]">
            モデル
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            文字起こしとテキスト変換用の AI モデルを設定します
          </p>
        </div>

        {/* Settings sections */}
        <div className="space-y-5">
          {/* Whisper Model */}
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ModelSelector
              label="音声認識"
              description="音声の文字起こしに使用するモデル"
              value={settings.whisperModel}
              options={WHISPER_MODELS}
              onChange={handleWhisperModelChange}
            />
          </div>

          {/* GPT Model */}
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ModelSelector
              label="テキスト変換"
              description="丁寧な表現への変換に使用するモデル"
              value={settings.gptModel}
              options={GPT_MODELS}
              onChange={handleGptModelChange}
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div className="mb-6 mt-8">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-[-0.02em]">
            外観
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            Politely の画面表示方法を設定します
          </p>
        </div>

        <div className="space-y-5">
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ToggleSwitch
              label="待機時にウィンドウを表示"
              description="録音していない時にフローティングウィンドウを表示します"
              checked={settings.showWindowOnIdle}
              onChange={handleShowWindowOnIdleChange}
            />
          </div>
        </div>

        {/* Shortcut Section */}
        <div className="mb-6 mt-8">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-[-0.02em]">
            ショートカット
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            キーボードショートカットを設定します
          </p>
        </div>

        <div className="space-y-5">
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ShortcutInput
              value={settings.globalShortcut ?? DEFAULT_SHORTCUT}
              onChange={handleShortcutChange}
            />
            {shortcutError && (
              <p className="text-[11px] text-red-400 mt-2">{shortcutError}</p>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="mb-6 mt-8">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-[-0.02em]">
            権限
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            Politely が正しく動作するために必要な権限です
          </p>
        </div>

        <div className="space-y-5">
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <div className="space-y-4">
              <PermissionStatus
                label="マイク"
                description="音声の録音に使用します"
                status={permissions?.microphone ?? "unknown"}
                onOpenSettings={() =>
                  window.settingsAPI.openMicrophoneSettings()
                }
              />
              <div className="border-t border-zinc-700/30" />
              <PermissionStatus
                label="アクセシビリティ"
                description="テキストの自動入力に使用します"
                status={permissions?.accessibility ?? "unknown"}
                onOpenSettings={() =>
                  window.settingsAPI.openAccessibilitySettings()
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
