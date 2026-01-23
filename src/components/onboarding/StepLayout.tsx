import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type StepLayoutProps = {
  variant: "hero" | "form";
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children?: ReactNode;
  helperText?: ReactNode;
};

export const StepLayout = ({
  variant,
  icon,
  title,
  description,
  children,
  helperText,
}: StepLayoutProps) => {
  const isHero = variant === "hero";

  return (
    <div
      className={cn("animate-fade-in", isHero && "flex flex-col items-center")}
    >
      {/* Icon */}
      {isHero ? icon : <div className="flex justify-center mb-6">{icon}</div>}

      {/* Title */}
      <h2
        className={cn(
          "text-zinc-100 text-center",
          isHero
            ? "text-[24px] font-bold tracking-[-0.03em] mb-3"
            : "text-[17px] font-semibold tracking-[-0.02em] mb-2",
        )}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        className={cn(
          "text-zinc-500 text-center leading-relaxed",
          isHero ? "text-[13px] max-w-[280px]" : "text-[12px] mb-8",
        )}
      >
        {description}
      </p>

      {/* Content */}
      {children}

      {/* Helper text */}
      {helperText && (
        <p className="text-[11px] text-zinc-600 text-center mt-4">
          {helperText}
        </p>
      )}
    </div>
  );
};

type StepIconProps = {
  children: ReactNode;
};

export const StepIcon = ({ children }: StepIconProps) => {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
      {children}
    </div>
  );
};

type StepCardProps = {
  error?: string | null;
  children: ReactNode;
};

export const StepCard = ({ error, children }: StepCardProps) => {
  return (
    <div
      className={cn(
        "p-4 bg-zinc-800/30 rounded-xl border",
        error ? "border-red-500/50 bg-red-500/5" : "border-zinc-800/50",
      )}
    >
      {children}
      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
    </div>
  );
};
