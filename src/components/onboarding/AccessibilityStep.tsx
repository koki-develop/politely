import { IconCheck, IconHandClick } from "@tabler/icons-react";
import { useCallback, useEffect, useRef } from "react";
import type { PermissionStatus } from "../../permissions/service";
import { StepIcon, StepLayout } from "./StepLayout";

type AccessibilityStepProps = {
  status: PermissionStatus | null;
  onStatusChange: (status: PermissionStatus) => void;
};

export const AccessibilityStep = ({
  status,
  onStatusChange,
}: AccessibilityStepProps) => {
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ポーリングを停止するヘルパー関数
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // 初期権限チェック
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permissions = await window.onboardingAPI.checkPermissions();
        onStatusChange(permissions.accessibility);
      } catch (error) {
        console.error("[AccessibilityStep] Failed to check permission:", error);
        onStatusChange("unknown");
      }
    };
    checkPermission();
  }, [onStatusChange]);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleRequestPermission = useCallback(async () => {
    try {
      // アクセシビリティ権限リクエスト（システムプロンプト表示）
      const granted =
        await window.onboardingAPI.requestAccessibilityPermission();

      if (granted) {
        onStatusChange("granted");
        return;
      }

      // まだ許可されていない場合、ポーリングで権限変更を検知
      stopPolling();

      pollIntervalRef.current = setInterval(async () => {
        try {
          const permissions = await window.onboardingAPI.checkPermissions();
          if (permissions.accessibility === "granted") {
            onStatusChange("granted");
            stopPolling();
          }
        } catch (error) {
          console.error("[AccessibilityStep] Polling error:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("[AccessibilityStep] Failed to request permission:", error);
    }
  }, [onStatusChange, stopPolling]);

  const isGranted = status === "granted";

  return (
    <StepLayout
      variant="form"
      icon={
        <StepIcon>
          <IconHandClick size={28} className="text-violet-400" stroke={1.5} />
        </StepIcon>
      }
      title="アクセシビリティへのアクセスを許可"
      description="テキストを自動入力するには、アクセシビリティへのアクセス許可が必要です。"
      helperText="システム設定から後で変更することもできます"
    >
      <div className="flex items-center justify-center">
        {isGranted ? (
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <IconCheck size={32} className="text-emerald-400" stroke={2} />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRequestPermission}
            className="px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 bg-violet-600 hover:bg-violet-500 text-white cursor-pointer active:scale-[0.98]"
          >
            許可する
          </button>
        )}
      </div>
    </StepLayout>
  );
};
