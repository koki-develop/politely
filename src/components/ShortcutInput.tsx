import { useCallback, useEffect, useId, useRef, useState } from "react";
import { DEFAULT_SHORTCUT } from "../settings/schema";
import {
  formatAcceleratorForDisplay,
  keyEventToAccelerator,
} from "../utils/shortcut";

type ShortcutInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ShortcutInput = ({ value, onChange }: ShortcutInputProps) => {
  const id = useId();
  const [isCapturing, setIsCapturing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const endCapture = useCallback(() => {
    setIsCapturing(false);
    window.settingsAPI.endShortcutCapture();
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
    window.settingsAPI.startShortcutCapture();
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
          ref={inputRef}
          id={id}
          type="button"
          onClick={handleClick}
          onBlur={handleBlur}
          className={`flex-1 h-9 px-3 flex items-center bg-zinc-800/60 border rounded-lg text-[13px] tracking-[-0.01em] cursor-pointer transition-all duration-150 ease-out hover:bg-zinc-800/80 hover:border-zinc-600/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 ${
            isCapturing
              ? "border-violet-500/50 ring-2 ring-violet-500/40"
              : "border-zinc-700/50"
          }`}
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
      {isCapturing && (
        <p className="text-[11px] text-zinc-500 mt-2">Escキーでキャンセル</p>
      )}
    </div>
  );
};
