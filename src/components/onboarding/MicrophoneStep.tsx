import { IconCheck, IconMicrophone } from "@tabler/icons-react";
import { useCallback, useEffect, useRef } from "react";
import type { PermissionStatus } from "../../permissions/service";

type MicrophoneStepProps = {
  status: PermissionStatus | null;
  onStatusChange: (status: PermissionStatus) => void;
};

export const MicrophoneStep = ({
  status,
  onStatusChange,
}: MicrophoneStepProps) => {
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ポーリングを停止するヘルパー関数
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
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
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
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
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
        }

        pollIntervalRef.current = setInterval(async () => {
          try {
            const permissions = await window.onboardingAPI.checkPermissions();
            if (permissions.microphone === "granted") {
              onStatusChange("granted");
              stopPolling();
              if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
                pollTimeoutRef.current = null;
              }
            }
          } catch (error) {
            console.error("[MicrophoneStep] Polling error:", error);
          }
        }, 1000);

        // 30秒後にポーリングを停止
        pollTimeoutRef.current = setTimeout(() => {
          stopPolling();
        }, 30000);
      }
    } catch (error) {
      console.error("[MicrophoneStep] Failed to request permission:", error);
    }
  }, [onStatusChange, stopPolling]);

  const isGranted = status === "granted";

  return (
    <div className="animate-fade-in">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <IconMicrophone size={28} className="text-violet-400" stroke={1.5} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[17px] font-semibold text-zinc-100 tracking-[-0.02em] text-center mb-2">
        マイクへのアクセスを許可
      </h2>
      <p className="text-[12px] text-zinc-500 text-center mb-12 leading-relaxed">
        音声入力を使用するには、マイクへのアクセス許可が必要です。
      </p>

      {/* Content */}
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

      {/* Helper text */}
      <p className="text-[11px] text-zinc-600 text-center mt-4">
        システム設定から後で変更することもできます
      </p>
    </div>
  );
};
