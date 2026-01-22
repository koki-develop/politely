import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { IPC_MAIN_TO_RENDERER } from "../ipc/channels";
import type { AppState } from "../state/appState";
import type { StateChangePayload, TranscribeResult } from "../types/electron";

// Alias for clarity - renderer uses same states as main process
type OverlayState = AppState;

const WINDOW_SIZE_IDLE = { width: 130, height: 32 };
const WINDOW_SIZE_RECORDING = { width: 120, height: 32 };
const WINDOW_SIZE_TRANSCRIBING = { width: 100, height: 32 };
const WINDOW_SIZE_ERROR = { width: 280, height: 100 };

// Static SVG Icons (hoisted to avoid re-creation on each render)
const micIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-violet-400"
    aria-hidden="true"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const alertIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-400 shrink-0"
    aria-hidden="true"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

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

  // Subscribe to state changes from Main Process (Single Source of Truth)
  useEffect(() => {
    window.electronAPI.onStateChanged((payload: StateChangePayload) => {
      setOverlayState(payload.state);
      setError(payload.error);
    });

    return () => {
      window.electronAPI.removeAllListeners(IPC_MAIN_TO_RENDERER.STATE_CHANGED);
    };
  }, []);

  const transcribe = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const result: TranscribeResult =
        await window.electronAPI.transcribe(arrayBuffer);

      if (result.success === true) {
        if (result.text) {
          window.electronAPI.sendTranscriptionComplete(result.text);
        } else {
          window.electronAPI.sendRecordingError("No speech detected");
        }
      } else if (result.success === false) {
        if (result.errorCode === "API_KEY_NOT_CONFIGURED") {
          window.electronAPI.openSettings();
        }
        window.electronAPI.sendRecordingError(result.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Transcription failed";
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
      // State is managed by Main Process via onStateChanged
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
      window.electronAPI.removeAllListeners(
        IPC_MAIN_TO_RENDERER.START_RECORDING,
      );
      window.electronAPI.removeAllListeners(
        IPC_MAIN_TO_RENDERER.STOP_RECORDING,
      );
    };
  }, [startRecording, stopRecording, recorderState]);

  useEffect(() => {
    if (recordError) {
      // State is managed by Main Process via onStateChanged
      window.electronAPI.sendRecordingError(recordError);
    }
  }, [recordError]);

  useEffect(() => {
    const sizes = {
      idle: WINDOW_SIZE_IDLE,
      recording: WINDOW_SIZE_RECORDING,
      transcribing: WINDOW_SIZE_TRANSCRIBING,
      error: WINDOW_SIZE_ERROR,
    };
    const size = sizes[overlayState];
    if (overlayState === "error") {
      // エラー状態では画面中央に配置
      window.electronAPI.centerWindow(size.width, size.height);
    } else {
      window.electronAPI.setWindowSize(size.width, size.height);
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
    // State is managed by Main Process via onStateChanged
    window.electronAPI.sendErrorDismissed();
  }, []);

  // Idle State
  if (overlayState === "idle") {
    return (
      <div className="w-full h-full flex items-center justify-center gap-2 glass-bg rounded-full border border-white/10 animate-breathe select-none [-webkit-app-region:drag]">
        {micIcon}
        <span className="text-zinc-500 text-[10px]">⌘⇧Space</span>
      </div>
    );
  }

  // Recording State
  if (overlayState === "recording") {
    return (
      <div className="w-full h-full flex items-center justify-center gap-3 glass-bg rounded-full border border-red-500/30 select-none [-webkit-app-region:drag] animate-fade-in">
        {/* Pulse Ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-red-500/40 to-orange-500/40 animate-pulse-ring" />
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-zinc-500 hover:text-white text-[10px] transition-colors [-webkit-app-region:no-drag]"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Transcribing State
  if (overlayState === "transcribing") {
    return (
      <div className="w-full h-full flex items-center justify-center glass-bg rounded-full border border-amber-500/30 select-none [-webkit-app-region:drag] animate-fade-in">
        {/* Wave Dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-wave" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-wave-delay-1" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-wave-delay-2" />
        </div>
      </div>
    );
  }

  // Error State
  if (overlayState === "error" && error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center glass-bg rounded-2xl border border-red-500/40 px-4 py-3 select-none [-webkit-app-region:drag] animate-fade-in">
        <div className="flex items-center gap-2">
          {alertIcon}
          <div className="max-h-12 overflow-y-auto [-webkit-app-region:no-drag]">
            <span className="text-red-400 text-xs break-all block">
              {error}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismissError}
          className="mt-2 text-zinc-500 hover:text-white text-xs transition-colors [-webkit-app-region:no-drag]"
        >
          Close
        </button>
      </div>
    );
  }

  return null;
};
