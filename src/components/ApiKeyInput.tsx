import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useCallback, useEffect, useId, useState } from "react";

type ApiKeyInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ApiKeyInput = ({ value, onChange }: ApiKeyInputProps) => {
  const id = useId();
  const [showKey, setShowKey] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // 外部からの value 変更を同期
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <div className="group">
      <label htmlFor={id} className="block mb-3">
        <span className="text-[13px] font-medium text-zinc-100 tracking-[-0.01em]">
          OpenAI API Key
        </span>
        <span className="block text-[11px] text-zinc-500 mt-0.5 tracking-[-0.01em]">
          OpenAI API の認証に使用されます
        </span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={showKey ? "text" : "password"}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="sk-..."
          className="w-full h-9 px-3 pr-10 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-[13px] text-zinc-200 tracking-[-0.01em] placeholder:text-zinc-600 transition-all duration-150 ease-out hover:bg-zinc-800/80 hover:border-zinc-600/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 select-text"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? (
            <IconEyeOff size={16} stroke={1.5} aria-hidden="true" />
          ) : (
            <IconEye size={16} stroke={1.5} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};
