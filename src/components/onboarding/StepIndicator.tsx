import { cn } from "../../utils/cn";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export const StepIndicator = ({
  currentStep,
  totalSteps,
}: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: ステップ数は固定で順序が変わらないため
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300 ease-out",
            index === currentStep
              ? "w-6 bg-violet-500"
              : index < currentStep
                ? "w-1.5 bg-violet-500/60"
                : "w-1.5 bg-zinc-700",
          )}
        />
      ))}
    </div>
  );
};
