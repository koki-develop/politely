import { useCallback, useEffect, useRef } from "react";
import { ERROR_CODES, ERROR_MESSAGES } from "../errors/codes";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useOverlayState } from "../hooks/useOverlayState";
import { useRecordingIpc } from "../hooks/useRecordingIpc";
import type { TranscribeResult } from "../types/electron";
import { ErrorOverlay } from "./overlay/ErrorOverlay";
// 状態別コンポーネント
import { IdleOverlay } from "./overlay/IdleOverlay";
import { PreparingOverlay } from "./overlay/PreparingOverlay";
import { RecordingStateOverlay } from "./overlay/RecordingStateOverlay";
import { TranscribingOverlay } from "./overlay/TranscribingOverlay";

/**
 * 録音オーバーレイのメインコンポーネント
 * 状態に応じて適切なサブコンポーネントを表示
 */
export function RecordingOverlay() {
  // 状態管理
  const { state: overlayState, error, globalShortcut } = useOverlayState();
  const {
    state: recorderState,
    error: recordError,
    startRecording,
    stopRecording,
    audioBlob,
    warmUpStream,
  } = useAudioRecorder();

  const isCancelledRef = useRef(false);

  // 録音開始/停止の IPC リスナー
  const handleStartRecording = useCallback(() => {
    isCancelledRef.current = false;
    startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    if (recorderState === "recording") {
      stopRecording();
    }
  }, [recorderState, stopRecording]);

  useRecordingIpc({
    onStartRecording: handleStartRecording,
    onStopRecording: handleStopRecording,
  });

  // 文字起こし実行
  const transcribe = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const result: TranscribeResult =
        await window.electronAPI.transcribe(arrayBuffer);

      if (result.success === true) {
        const trimmedText = result.text.trim();
        if (trimmedText) {
          window.electronAPI.sendTranscriptionComplete(trimmedText);
        } else {
          window.electronAPI.sendRecordingError({
            code: ERROR_CODES.NO_SPEECH_DETECTED,
            message: ERROR_MESSAGES[ERROR_CODES.NO_SPEECH_DETECTED],
          });
        }
      } else {
        // キャンセル操作の場合はエラー通知せず静かに終了
        if (isCancelledRef.current) {
          return;
        }
        if (result.errorCode === ERROR_CODES.API_KEY_NOT_CONFIGURED) {
          window.electronAPI.openSettings();
        }
        window.electronAPI.sendRecordingError({
          code: result.errorCode,
          message: result.error,
        });
      }
    } catch (err) {
      window.electronAPI.sendRecordingError({
        code: ERROR_CODES.TRANSCRIPTION_FAILED,
        message: err instanceof Error ? err.message : "Transcription failed",
      });
    }
  }, []);

  // 音声データが準備できたら文字起こし
  useEffect(() => {
    if (audioBlob && !isCancelledRef.current) {
      transcribe(audioBlob);
    }
  }, [audioBlob, transcribe]);

  // レコーダーエラーを Main Process に通知
  useEffect(() => {
    if (recordError) {
      window.electronAPI.sendRecordingError({
        code: ERROR_CODES.RECORDING_FAILED,
        message: recordError,
      });
    }
  }, [recordError]);

  // Idle 状態でストリームをプリウォーム
  useEffect(() => {
    if (overlayState === "idle") {
      warmUpStream();
    }
  }, [overlayState, warmUpStream]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    if (recorderState === "recording") {
      stopRecording();
    }
    window.electronAPI.sendRecordingCancelled();
  }, [recorderState, stopRecording]);

  // 準備中のキャンセル
  const handlePreparingCancel = useCallback(() => {
    isCancelledRef.current = true;
    window.electronAPI.sendRecordingCancelled();
  }, []);

  // 文字起こし中のキャンセル
  const handleTranscribingCancel = useCallback(() => {
    isCancelledRef.current = true;
    window.electronAPI.sendTranscribingCancelled();
  }, []);

  // エラー dismiss
  const handleDismissError = useCallback(() => {
    window.electronAPI.sendErrorDismissed();
  }, []);

  // 状態に応じたコンポーネントを表示
  switch (overlayState) {
    case "idle":
      return <IdleOverlay shortcut={globalShortcut} />;

    case "preparing":
      return <PreparingOverlay onCancel={handlePreparingCancel} />;

    case "recording":
      return (
        <RecordingStateOverlay
          shortcut={globalShortcut}
          onCancel={handleCancel}
        />
      );

    case "transcribing":
      return <TranscribingOverlay onCancel={handleTranscribingCancel} />;

    case "error":
      return (
        <ErrorOverlay
          errorCode={error?.code ?? null}
          errorMessage={error?.message ?? "エラーが発生しました"}
          onDismiss={handleDismissError}
        />
      );

    default:
      return null;
  }
}
