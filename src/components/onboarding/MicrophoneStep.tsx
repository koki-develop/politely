import { IconCheck, IconMicrophone } from "@tabler/icons-react";
import { useCallback, useEffect, useRef } from "react";
import type { PermissionStatus } from "../../permissions/service";
import { StepIcon, StepLayout } from "./StepLayout";

type MicrophoneStepProps = {
  status: PermissionStatus | null;
  onStatusChange: (status: PermissionStatus) => void;
};

export const MicrophoneStep = ({
  status,
  onStatusChange,
}: MicrophoneStepProps) => {
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
        onStatusChange(permissions.microphone);
      } catch (error) {
        console.error("[MicrophoneStep] Failed to check permission:", error);
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
      // マイク権限リクエスト（システムダイアログ表示）
      const granted = await window.onboardingAPI.requestMicrophonePermission();

      if (granted) {
        onStatusChange("granted");
      } else {
        // 拒否された場合はシステム設定を開く
        window.onboardingAPI.openMicrophoneSettings();

        // 設定画面を開いた後、権限変更をポーリングで検知
        stopPolling();

        pollIntervalRef.current = setInterval(async () => {
          try {
            const permissions = await window.onboardingAPI.checkPermissions();
            if (permissions.microphone === "granted") {
              onStatusChange("granted");
              stopPolling();
            }
          } catch (error) {
            console.error("[MicrophoneStep] Polling error:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("[MicrophoneStep] Failed to request permission:", error);
    }
  }, [onStatusChange, stopPolling]);

  const isGranted = status === "granted";

  return (
    <StepLayout
      variant="form"
      icon={
        <StepIcon>
          <IconMicrophone size={28} className="text-violet-400" stroke={1.5} />
        </StepIcon>
      }
      title="マイクへのアクセスを許可"
      description="音声入力を使用するために必要です。"
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
