import { IconChevronDown } from "@tabler/icons-react";
import { useId } from "react";

type ModelSelectorProps<T extends string> = {
  label: string;
  description: string;
  value: T;
  options: readonly T[];
  labels?: Record<T, string>;
  onChange: (value: T) => void;
};

export const ModelSelector = <T extends string>({
  label,
  description,
  value,
  options,
  labels,
  onChange,
}: ModelSelectorProps<T>) => {
  const id = useId();

  return (
    <div className="group">
      <label htmlFor={id} className="block mb-3">
        <span className="text-[13px] font-medium text-zinc-100 tracking-[-0.01em]">
          {label}
        </span>
        <span className="block text-[11px] text-zinc-500 mt-0.5 tracking-[-0.01em]">
          {description}
        </span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full h-9 px-3 pr-8 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-[13px] text-zinc-200 tracking-[-0.01em] appearance-none cursor-pointer transition-all duration-150 ease-out hover:bg-zinc-800/80 hover:border-zinc-600/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-zinc-800">
              {labels ? labels[option] : option}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-400 transition-colors">
          <IconChevronDown size={12} stroke={1.5} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
