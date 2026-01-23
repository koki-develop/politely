import type { PermissionStatus as PermissionStatusType } from "../permissions/service";

type PermissionStatusProps = {
  label: string;
  description: string;
  status: PermissionStatusType;
  onRequestPermission: () => Promise<boolean>;
  onOpenSettings: () => void;
};

export const PermissionStatus = ({
  label,
  description,
  status,
  onRequestPermission,
  onOpenSettings,
}: PermissionStatusProps) => {
  const isGranted = status === "granted";

  const handleClick = async () => {
    try {
      const granted = await onRequestPermission();
      if (!granted) {
        onOpenSettings();
      }
    } catch (error) {
      console.error("[PermissionStatus] Failed to request permission:", error);
      onOpenSettings();
    }
  };

  return (
    <div className="group flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-zinc-100 tracking-[-0.01em]">
            {label}
          </span>
          <span
            className={`
              px-2 py-0.5 text-[10px] font-medium rounded-full
              ${
                isGranted
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }
            `}
          >
            {isGranted ? "許可済み" : "未許可"}
          </span>
        </div>
        <span className="block text-[11px] text-zinc-500 mt-0.5 tracking-[-0.01em]">
          {description}
        </span>
      </div>
      {!isGranted && (
        <button
          type="button"
          onClick={handleClick}
          className="px-3 py-1.5 text-[12px] font-medium text-violet-400 bg-violet-500/10
                     rounded-lg border border-violet-500/20 hover:bg-violet-500/20
                     transition-colors cursor-pointer"
        >
          許可する
        </button>
      )}
    </div>
  );
};
