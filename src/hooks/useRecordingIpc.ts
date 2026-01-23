import { useEffect } from "react";
import { IPC_MAIN_TO_RENDERER } from "../ipc/channels";

type UseRecordingIpcProps = {
  onStartRecording: () => void;
  onStopRecording: () => void;
};

/**
 * Main Process からの録音開始/停止 IPC を購読するカスタムフック
 */
export function useRecordingIpc({
  onStartRecording,
  onStopRecording,
}: UseRecordingIpcProps): void {
  useEffect(() => {
    window.electronAPI.onStartRecording(onStartRecording);
    window.electronAPI.onStopRecording(onStopRecording);

    return () => {
      window.electronAPI.removeAllListeners(
        IPC_MAIN_TO_RENDERER.START_RECORDING,
      );
      window.electronAPI.removeAllListeners(
        IPC_MAIN_TO_RENDERER.STOP_RECORDING,
      );
    };
  }, [onStartRecording, onStopRecording]);
}
