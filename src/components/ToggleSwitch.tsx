import { useId } from "react";

type ToggleSwitchProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const ToggleSwitch = ({
  label,
  description,
  checked,
  onChange,
}: ToggleSwitchProps) => {
  const id = useId();

  return (
    <div className="group flex items-center justify-between">
      <label htmlFor={id} className="flex-1 cursor-pointer">
        <span className="text-[13px] font-medium text-zinc-100 tracking-[-0.01em]">
          {label}
        </span>
        <span className="block text-[11px] text-zinc-500 mt-0.5 tracking-[-0.01em]">
          {description}
        </span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-all duration-200 ease-out cursor-pointer
          ${checked ? "bg-violet-500" : "bg-zinc-700 hover:bg-zinc-600"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
};
