import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

type TranscribeResponse = {
  text?: string;
  error?: string;
};

type OverlayState = "idle" | "recording" | "transcribing" | "error";

const WINDOW_SIZE_NORMAL = { width: 200, height: 80 };
const WINDOW_SIZE_ERROR = { width: 280, height: 120 };

export const RecordingOverlay = () => {
  const {
    state: recorderState,
    error: recordError,
    startRecording,
    stopRecording,
    audioBlob,
  } = useAudioRecorder();

  const [overlayState, setOverlayState] = useState<OverlayState>("idle");
  const [error, setError] = useState<string | null>(null);
  const isCancelledRef = useRef(false);
  const authTokenRef = useRef<string | null>(null);

  useEffect(() => {
    window.electronAPI.onAuthToken((token) => {
      authTokenRef.current = token;
    });
    return () => {
      window.electronAPI.removeAllListeners("auth-token");
    };
  }, []);

  useEffect(() => {
    const handleResetState = () => {
      setOverlayState("idle");
      setError(null);
    };
    window.electronAPI.onResetState(handleResetState);
    return () => {
      window.electronAPI.removeAllListeners("reset-state");
    };
  }, []);

  const transcribe = useCallback(async (blob: Blob) => {
    setOverlayState("transcribing");
    setError(null);

    if (!authTokenRef.current) {
      setError("Authentication not ready");
      setOverlayState("error");
      window.electronAPI.sendRecordingError("Authentication not ready");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("http://localhost:3001/api/transcribe", {
        method: "POST",
        body: formData,
        headers: {
          "X-Auth-Token": authTokenRef.current,
        },
      });

      const data: TranscribeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      if (data.text) {
        window.electronAPI.sendTranscriptionComplete(data.text);
      } else {
        setError("No speech detected");
        setOverlayState("error");
        window.electronAPI.sendRecordingError("No speech detected");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Transcription failed";
      setError(errorMessage);
      setOverlayState("error");
      window.electronAPI.sendRecordingError(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (audioBlob && !isCancelledRef.current) {
      transcribe(audioBlob);
    }
  }, [audioBlob, transcribe]);

  useEffect(() => {
    const handleStartRecording = () => {
      isCancelledRef.current = false;
      setOverlayState("recording");
      setError(null);
      startRecording();
    };

    const handleStopRecording = () => {
      if (recorderState === "recording") {
        stopRecording();
      }
    };

    window.electronAPI.onStartRecording(handleStartRecording);
    window.electronAPI.onStopRecording(handleStopRecording);

    return () => {
      window.electronAPI.removeAllListeners("start-recording");
      window.electronAPI.removeAllListeners("stop-recording");
    };
  }, [startRecording, stopRecording, recorderState]);

  useEffect(() => {
    if (recordError) {
      setError(recordError);
      setOverlayState("error");
      window.electronAPI.sendRecordingError(recordError);
    }
  }, [recordError]);

  useEffect(() => {
    if (overlayState === "error") {
      window.electronAPI.setWindowSize(
        WINDOW_SIZE_ERROR.width,
        WINDOW_SIZE_ERROR.height,
      );
    } else if (overlayState === "recording") {
      window.electronAPI.setWindowSize(
        WINDOW_SIZE_NORMAL.width,
        WINDOW_SIZE_NORMAL.height,
      );
    }
  }, [overlayState]);

  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    if (recorderState === "recording") {
      stopRecording();
    }
    window.electronAPI.sendRecordingCancelled();
  }, [recorderState, stopRecording]);

  const handleDismissError = useCallback(() => {
    window.electronAPI.sendErrorDismissed();
    setOverlayState("idle");
    setError(null);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/90 rounded-xl p-4 select-none [-webkit-app-region:drag]">
      <div className="flex items-center gap-2 mb-2">
        {overlayState === "recording" && (
          <>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Recording...</span>
          </>
        )}
        {overlayState === "transcribing" && (
          <>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">
              Transcribing...
            </span>
          </>
        )}
        {overlayState === "error" && error && (
          <div className="max-h-16 overflow-y-auto [-webkit-app-region:no-drag]">
            <span className="text-red-400 text-xs text-center break-all">
              {error}
            </span>
          </div>
        )}
      </div>

      {overlayState === "recording" && (
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-white text-xs underline [-webkit-app-region:no-drag]"
        >
          Cancel
        </button>
      )}

      {overlayState === "error" && (
        <button
          type="button"
          onClick={handleDismissError}
          className="text-gray-400 hover:text-white text-xs underline [-webkit-app-region:no-drag]"
        >
          Close
        </button>
      )}
    </div>
  );
};
