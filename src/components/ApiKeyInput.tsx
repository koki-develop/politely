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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
