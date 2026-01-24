import { useCallback, useEffect, useRef, useState } from "react";
import { ERROR_CODES } from "../errors/codes";

type RecordingState = "idle" | "recording" | "processing";

type UseAudioRecorderReturn = {
  state: RecordingState;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  audioBlob: Blob | null;
  warmUpStream: () => Promise<void>;
};

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isWarmingUpRef = useRef<boolean>(false);

  /**
   * MediaStream を取得してキャッシュする
   */
  const warmUpStream = useCallback(async () => {
    if (isWarmingUpRef.current || streamRef.current) return;
    isWarmingUpRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("[AudioRecorder] MediaStream pre-warmed");
    } catch (err) {
      console.error("[AudioRecorder] Failed to pre-warm MediaStream:", err);
      // エラーは startRecording 時に再試行するので、ここではセットしない
    } finally {
      isWarmingUpRef.current = false;
    }
  }, []);

  /**
   * ストリームを解放する
   */
  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  // プリウォーム: コンポーネントマウント時に MediaStream を取得
  useEffect(() => {
    warmUpStream();

    // クリーンアップ: コンポーネントアンマウント時にストリームを解放
    return () => {
      releaseStream();
      console.log("[AudioRecorder] MediaStream released on unmount");
    };
  }, [warmUpStream, releaseStream]);

  /**
   * MediaRecorder をセットアップして録音開始
   */
  const setupAndStartRecording = useCallback(
    (stream: MediaStream) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setState("idle");

        // 録音停止後、新しいストリームをプリウォーム
        releaseStream();
        warmUpStream();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState("recording");

      // Main Process に録音開始を通知（preparing -> recording）
      window.electronAPI.sendRecordingStarted();
    },
    [releaseStream, warmUpStream],
  );

  const startRecording = useCallback(() => {
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    // 既にストリームがある場合は即座に録音開始
    if (streamRef.current) {
      try {
        setupAndStartRecording(streamRef.current);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start recording";
        console.error("[AudioRecorder] Failed to start recording:", err);
        setError(errorMessage);
        setState("idle");
        window.electronAPI.sendRecordingError({
          code: ERROR_CODES.RECORDING_FAILED,
          message: errorMessage,
        });
      }
    } else {
      // フォールバック: ストリームがない場合は取得してから開始
      console.warn(
        "[AudioRecorder] Stream not pre-warmed, acquiring on demand",
      );
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
          setupAndStartRecording(stream);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to start recording";
          console.error(
            "[AudioRecorder] Failed to start recording in fallback:",
            err,
          );
          setError(errorMessage);
          setState("idle");
          window.electronAPI.sendRecordingError({
            code: ERROR_CODES.RECORDING_FAILED,
            message: errorMessage,
          });
        }
      })();
    }
  }, [setupAndStartRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setState("processing");
    }
  }, []);

  return {
    state,
    error,
    startRecording,
    stopRecording,
    audioBlob,
    warmUpStream,
  };
};
