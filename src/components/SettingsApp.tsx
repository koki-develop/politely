import { useCallback, useEffect, useState } from "react";
import { IPC_MAIN_TO_RENDERER } from "../ipc/channels";
import {
  type AppSettings,
  GPT_MODELS,
  type GptModel,
  WHISPER_MODELS,
  type WhisperModel,
} from "../settings/schema";
import { ModelSelector } from "./ModelSelector";

export const SettingsApp = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.settingsAPI.requestSettings();

    window.settingsAPI.onSettingsData((data: AppSettings) => {
      setSettings(data);
      setIsSaving(false);
    });

    return () => {
      window.settingsAPI.removeAllListeners(IPC_MAIN_TO_RENDERER.SETTINGS_DATA);
    };
  }, []);

  const handleWhisperModelChange = useCallback((model: WhisperModel) => {
    setIsSaving(true);
    window.settingsAPI.updateSettings({ whisperModel: model });
  }, []);

  const handleGptModelChange = useCallback((model: GptModel) => {
    setIsSaving(true);
    window.settingsAPI.updateSettings({ gptModel: model });
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
        {/* Header */}
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
              disabled={isSaving}
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
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      <div
        className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 rounded-full text-[11px] text-zinc-400 transition-all duration-200 ease-out ${isSaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
        <span>Saving...</span>
      </div>
    </div>
  );
};
