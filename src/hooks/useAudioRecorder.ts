import { useCallback, useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "processing";

type UseAudioRecorderReturn = {
  state: RecordingState;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  audioBlob: Blob | null;
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
        setError(
          err instanceof Error ? err.message : "Failed to start recording",
        );
        setState("idle");
      }
    } else {
      // フォールバック: ストリームがない場合は取得してから開始
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
          setupAndStartRecording(stream);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to start recording",
          );
          setState("idle");
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
  };
};
