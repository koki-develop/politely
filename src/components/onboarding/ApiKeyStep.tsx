import { IconKey } from "@tabler/icons-react";
import { cn } from "../../utils/cn";
import { ApiKeyInput } from "../ApiKeyInput";

type ApiKeyStepProps = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

export const ApiKeyStep = ({ value, onChange, error }: ApiKeyStepProps) => {
  return (
    <div className="animate-fade-in">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <IconKey size={28} className="text-violet-400" stroke={1.5} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[17px] font-semibold text-zinc-100 tracking-[-0.02em] text-center mb-2">
        OpenAI API キーを設定
      </h2>
      <p className="text-[12px] text-zinc-500 text-center mb-8 leading-relaxed">
        音声認識と丁寧語変換に OpenAI の API を使用します。
        <br />
        API キーは安全にローカルに保存されます。
      </p>

      {/* Input Card */}
      <div
        className={cn(
          "p-4 bg-zinc-800/30 rounded-xl border",
          error ? "border-red-500/50 bg-red-500/5" : "border-zinc-800/50",
        )}
      >
        <ApiKeyInput value={value} onChange={onChange} />
        {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-zinc-600 text-center mt-4">
        API キーは{" "}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400/80 hover:text-violet-400 transition-colors"
        >
          OpenAI のダッシュボード
        </a>{" "}
        から取得できます
      </p>
    </div>
  );
};
