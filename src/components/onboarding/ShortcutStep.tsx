import { IconCommand } from "@tabler/icons-react";
import { useCallback, useEffect, useId, useState } from "react";
import { DEFAULT_SHORTCUT } from "../../settings/schema";
import { cn } from "../../utils/cn";
import {
  formatAcceleratorForDisplay,
  keyEventToAccelerator,
} from "../../utils/shortcut";
import { StepCard, StepIcon, StepLayout } from "./StepLayout";

type ShortcutStepProps = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

export const ShortcutStep = ({ value, onChange, error }: ShortcutStepProps) => {
  const id = useId();
  const [isCapturing, setIsCapturing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const endCapture = useCallback(() => {
    setIsCapturing(false);
    window.onboardingAPI.endShortcutCapture();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isCapturing) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        endCapture();
        return;
      }

      const accelerator = keyEventToAccelerator(event);
      if (accelerator) {
        setLocalValue(accelerator);
        onChange(accelerator);
        endCapture();
      }
    },
    [isCapturing, onChange, endCapture],
  );

  useEffect(() => {
    if (isCapturing) {
      window.addEventListener("keydown", handleKeyDown, true);
      return () => {
        window.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [isCapturing, handleKeyDown]);

  const handleClick = useCallback(() => {
    setIsCapturing(true);
    window.onboardingAPI.startShortcutCapture();
  }, []);

  const handleBlur = useCallback(() => {
    if (isCapturing) {
      endCapture();
    }
  }, [isCapturing, endCapture]);

  const handleReset = useCallback(() => {
    setLocalValue(DEFAULT_SHORTCUT);
    onChange(DEFAULT_SHORTCUT);
  }, [onChange]);

  return (
    <StepLayout
      variant="form"
      icon={
        <StepIcon>
          <IconCommand size={28} className="text-violet-400" stroke={1.5} />
        </StepIcon>
      }
      title="ショートカットを設定"
      description={
        <>
          グローバルショートカットで、どのアプリからでも
          <br />
          すぐに Politely を呼び出せます。
        </>
      }
      helperText="設定は後から変更できます"
    >
      <StepCard error={error}>
        <div className="group">
          <label htmlFor={id} className="block mb-3">
            <span className="text-[13px] font-medium text-zinc-100 tracking-[-0.01em]">
              グローバルショートカット
            </span>
            <span className="block text-[11px] text-zinc-500 mt-0.5 tracking-[-0.01em]">
              録音の開始/停止に使用するキーボードショートカット
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button
              id={id}
              type="button"
              onClick={handleClick}
              onBlur={handleBlur}
              className={cn(
                "flex-1 h-9 px-3 flex items-center bg-zinc-800/60 border rounded-lg text-[13px] tracking-[-0.01em] cursor-pointer transition-all duration-150 ease-out hover:bg-zinc-800/80 hover:border-zinc-600/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50",
                isCapturing
                  ? "border-violet-500/50 ring-2 ring-violet-500/40"
                  : "border-zinc-700/50",
              )}
            >
              {isCapturing ? (
                <span className="text-zinc-400 animate-pulse">
                  キーを入力してください...
                </span>
              ) : (
                <span className="text-zinc-200 font-mono">
                  {formatAcceleratorForDisplay(localValue)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-zinc-500 hover:text-zinc-400 transition-colors text-[11px] px-2 py-1 cursor-pointer"
              title="デフォルトにリセット"
            >
              リセット
            </button>
          </div>
        </div>
      </StepCard>
    </StepLayout>
  );
};
