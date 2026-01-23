import { IconChevronLeft } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import type { PermissionStatus } from "../permissions/service";
import {
  type AppSettings,
  DEFAULT_SHORTCUT,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "../settings/schema";
import { cn } from "../utils/cn";
import { ApiKeyStep } from "./onboarding/ApiKeyStep";
import { CompleteStep } from "./onboarding/CompleteStep";
import { MicrophoneStep } from "./onboarding/MicrophoneStep";
import { ShortcutStep } from "./onboarding/ShortcutStep";
import { StepIndicator } from "./onboarding/StepIndicator";
import { WelcomeStep } from "./onboarding/WelcomeStep";

export const OnboardingApp = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [microphoneStatus, setMicrophoneStatus] =
    useState<PermissionStatus | null>(null);

  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);

  useEffect(() => {
    const init = async () => {
      try {
        const [onboardingState, appSettings] = await Promise.all([
          window.onboardingAPI.getOnboardingState(),
          window.onboardingAPI.getSettings(),
        ]);
        setCurrentStep(onboardingState.currentStep);
        setSettings(appSettings);
      } catch (error) {
        console.error("[Onboarding] Failed to initialize:", error);
        setInitError("初期化に失敗しました。アプリを再起動してください。");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleApiKeyChange = useCallback(async (apiKey: string) => {
    setApiKeyError(null);
    try {
      const result = await window.onboardingAPI.updateSettings({ apiKey });
      if (result.success) {
        setSettings(result.settings);
      } else {
        console.error("[Onboarding] Failed to save API key:", result.error);
        setApiKeyError("API キーの保存に失敗しました。");
      }
    } catch (error) {
      console.error("[Onboarding] IPC error while saving API key:", error);
      setApiKeyError("設定の保存中にエラーが発生しました。");
    }
  }, []);

  const handleShortcutChange = useCallback(async (shortcut: string) => {
    setShortcutError(null);
    try {
      const result = await window.onboardingAPI.updateSettings({
        globalShortcut: shortcut,
      });
      if (result.success) {
        setSettings(result.settings);
      } else {
        setShortcutError(result.error);
      }
    } catch (error) {
      console.error("[Onboarding] IPC error while saving shortcut:", error);
      setShortcutError("設定の保存中にエラーが発生しました。");
    }
  }, []);

  const handleNext = useCallback(async () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      const nextStep = ONBOARDING_STEPS[nextIndex];
      setCurrentStep(nextStep);
      try {
        await window.onboardingAPI.updateOnboardingState({
          currentStep: nextStep,
        });
      } catch (error) {
        console.error("[Onboarding] Failed to persist step:", error);
      }
    } else {
      try {
        await window.onboardingAPI.completeOnboarding();
        window.close();
      } catch (error) {
        console.error("[Onboarding] Failed to complete onboarding:", error);
        window.close();
      }
    }
  }, [currentStepIndex]);

  const handleBack = useCallback(async () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = ONBOARDING_STEPS[prevIndex];
      setCurrentStep(prevStep);
      try {
        await window.onboardingAPI.updateOnboardingState({
          currentStep: prevStep,
        });
      } catch (error) {
        console.error("[Onboarding] Failed to persist step:", error);
      }
    }
  }, [currentStepIndex]);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 text-[13px]">
          <div className="w-3 h-3 border-2 border-zinc-600 border-t-violet-500 rounded-full animate-spin" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (initError || !settings) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-red-400 text-[13px] mb-4">
            {initError ?? "設定の読み込みに失敗しました。"}
          </p>
          <button
            type="button"
            onClick={() => window.close()}
            className="text-[13px] text-zinc-400 hover:text-zinc-300 transition-colors px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  // 最初と最後のステップではスキップボタンを表示しない
  const showSkipButton =
    currentStep !== "welcome" && currentStep !== "completed";
  // 最初のステップでは戻るボタンを表示しない
  const showBackButton = currentStep !== "welcome";
  // 最後のステップではボタンテキストを変更
  const isLastStep = currentStep === "completed";
  // APIキー未入力時、またはマイク未許可時は次へボタンを無効にする
  const isNextDisabled =
    (currentStep === "api-key" && !settings.apiKey) ||
    (currentStep === "microphone" && microphoneStatus !== "granted");
  // welcome と completed 以外は上寄せ
  const isTopAlignedStep =
    currentStep !== "welcome" && currentStep !== "completed";

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col select-none overflow-hidden">
      {/* Titlebar drag region */}
      <div className="h-7 flex-shrink-0 [-webkit-app-region:drag]" />

      {/* Content */}
      <div
        className={cn(
          "flex-1 px-8 flex flex-col",
          isTopAlignedStep ? "justify-start pt-8" : "justify-center",
        )}
      >
        <div className="max-w-sm mx-auto w-full">
          {currentStep === "welcome" && <WelcomeStep />}
          {currentStep === "api-key" && (
            <ApiKeyStep
              value={settings.apiKey ?? ""}
              onChange={handleApiKeyChange}
              error={apiKeyError}
            />
          )}
          {currentStep === "microphone" && (
            <MicrophoneStep
              status={microphoneStatus}
              onStatusChange={setMicrophoneStatus}
            />
          )}
          {currentStep === "shortcut-key" && (
            <ShortcutStep
              value={settings.globalShortcut ?? DEFAULT_SHORTCUT}
              onChange={handleShortcutChange}
              error={shortcutError}
            />
          )}
          {currentStep === "completed" && <CompleteStep />}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center py-4">
        <StepIndicator
          currentStep={currentStepIndex}
          totalSteps={ONBOARDING_STEPS.length}
        />
      </div>

      {/* Footer with buttons */}
      <div className="flex-shrink-0 px-8 pb-6">
        <div className="flex items-center justify-between">
          {/* Left side: Back button */}
          <div className="flex-1">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-[13px] text-zinc-500 hover:text-zinc-400 transition-colors px-2 py-1.5 -ml-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
              >
                <IconChevronLeft size={16} stroke={2} />
                <span>戻る</span>
              </button>
            )}
          </div>

          {/* Right side: Skip + Next/Complete buttons */}
          <div className="flex items-center gap-2">
            {showSkipButton && (
              <button
                type="button"
                onClick={handleNext}
                className="text-[13px] text-zinc-500 hover:text-zinc-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
              >
                後で
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
              className={cn(
                "text-[13px] font-medium px-5 py-2 rounded-lg transition-all duration-150",
                isNextDisabled
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer active:scale-[0.98]",
              )}
            >
              {isLastStep ? "始める" : "次へ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
