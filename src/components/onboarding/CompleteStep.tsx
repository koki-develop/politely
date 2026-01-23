import { IconCheck } from "@tabler/icons-react";

export const CompleteStep = () => {
  return (
    <div className="animate-fade-in flex flex-col items-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
        <IconCheck size={40} className="text-white" stroke={2} />
      </div>

      {/* Title */}
      <h1 className="text-[24px] font-bold text-zinc-100 tracking-[-0.03em] text-center mb-3">
        設定が完了しました
      </h1>

      {/* Description */}
      <p className="text-[13px] text-zinc-500 text-center leading-relaxed max-w-[280px]">
        さっそく使ってみましょう。
      </p>
    </div>
  );
};
