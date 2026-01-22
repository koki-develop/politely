import { useCallback, useEffect, useState } from "react";
import { IPC_MAIN_TO_RENDERER } from "../ipc/channels";
import {
  type AppSettings,
  GPT_MODELS,
  type GptModel,
  WHISPER_MODELS,
  type WhisperModel,
} from "../settings/schema";
import { ApiKeyInput } from "./ApiKeyInput";
import { ModelSelector } from "./ModelSelector";
import { ToggleSwitch } from "./ToggleSwitch";

export const SettingsApp = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    window.settingsAPI.requestSettings();

    window.settingsAPI.onSettingsData((data: AppSettings) => {
      setSettings(data);
    });

    return () => {
      window.settingsAPI.removeAllListeners(IPC_MAIN_TO_RENDERER.SETTINGS_DATA);
    };
  }, []);

  const handleWhisperModelChange = useCallback((model: WhisperModel) => {
    window.settingsAPI.updateSettings({ whisperModel: model });
  }, []);

  const handleGptModelChange = useCallback((model: GptModel) => {
    window.settingsAPI.updateSettings({ gptModel: model });
  }, []);

  const handleApiKeyChange = useCallback((apiKey: string) => {
    window.settingsAPI.updateSettings({ apiKey });
  }, []);

  const handleShowWindowOnIdleChange = useCallback((checked: boolean) => {
    window.settingsAPI.updateSettings({ showWindowOnIdle: checked });
  }, []);

  if (!settings) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 text-[13px]">
          <div className="w-3 h-3 border-2 border-zinc-600 border-t-violet-500 rounded-full animate-spin" />
          <span>Loading...</span>
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
            API Key
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            Configure your OpenAI API key for authentication
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
            Models
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            Configure AI models for transcription and text conversion
          </p>
        </div>

        {/* Settings sections */}
        <div className="space-y-5">
          {/* Whisper Model */}
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ModelSelector
              label="Speech-to-Text"
              description="Model for voice transcription"
              value={settings.whisperModel}
              options={WHISPER_MODELS}
              onChange={handleWhisperModelChange}
            />
          </div>

          {/* GPT Model */}
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ModelSelector
              label="Text Conversion"
              description="Model for polite language conversion"
              value={settings.gptModel}
              options={GPT_MODELS}
              onChange={handleGptModelChange}
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div className="mb-6 mt-8">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-[-0.02em]">
            Appearance
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-[-0.01em]">
            Configure how Politely appears on your screen
          </p>
        </div>

        <div className="space-y-5">
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
            <ToggleSwitch
              label="Show Window When Idle"
              description="Display the floating window when not recording"
              checked={settings.showWindowOnIdle}
              onChange={handleShowWindowOnIdleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
