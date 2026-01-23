import { IconCheck } from "@tabler/icons-react";
import { StepLayout } from "./StepLayout";

export const CompleteStep = () => {
  return (
    <StepLayout
      variant="hero"
      icon={
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
          <IconCheck size={40} className="text-white" stroke={2} />
        </div>
      }
      title="設定が完了しました"
      description="さっそく使ってみましょう。"
    />
  );
};
