import { useCallback, useEffect, useRef } from "react";
import { ERROR_CODES, ERROR_MESSAGES } from "../errors/codes";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useOverlayState } from "../hooks/useOverlayState";
import { useRecordingIpc } from "../hooks/useRecordingIpc";
import type {
  ConvertToPoliteResult,
  TranscribeAudioResult,
} from "../types/electron";
import { ConvertingOverlay } from "./overlay/ConvertingOverlay";
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
  const {
    state: overlayState,
    error,
    rawText,
    globalShortcut,
  } = useOverlayState();
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

  // 文字起こし実行（2段階処理）
  const transcribe = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();

      // 1. 音声文字起こし（Whisper API）
      const transcribeResult: TranscribeAudioResult =
        await window.electronAPI.transcribeAudio(arrayBuffer);

      if (transcribeResult.success !== true) {
        // キャンセル操作の場合はエラー通知せず静かに終了
        if (isCancelledRef.current) {
          return;
        }
        if (transcribeResult.errorCode === ERROR_CODES.API_KEY_NOT_CONFIGURED) {
          window.electronAPI.openSettings();
        }
        window.electronAPI.sendRecordingError({
          code: transcribeResult.errorCode,
          message: transcribeResult.error,
        });
        return;
      }

      const rawText = transcribeResult.text.trim();
      if (!rawText) {
        window.electronAPI.sendRecordingError({
          code: ERROR_CODES.NO_SPEECH_DETECTED,
          message: ERROR_MESSAGES[ERROR_CODES.NO_SPEECH_DETECTED],
        });
        return;
      }

      // 丁寧度が「オフ」の場合は変換をスキップ
      const settings = await window.electronAPI.getSettings();
      if (settings.politenessLevel === "off") {
        window.electronAPI.sendTranscriptionComplete(rawText);
        return;
      }

      // 状態を converting に遷移（生テキストを通知）
      window.electronAPI.sendTranscriptionProgress(rawText);

      // 2. 丁寧語変換（GPT API）
      const convertResult: ConvertToPoliteResult =
        await window.electronAPI.convertToPolite(rawText);

      if (convertResult.success !== true) {
        // キャンセル操作の場合はエラー通知せず静かに終了
        if (isCancelledRef.current) {
          return;
        }
        window.electronAPI.sendRecordingError({
          code: convertResult.errorCode,
          message: convertResult.error,
        });
        return;
      }

      const politeText = convertResult.text.trim();
      if (politeText) {
        window.electronAPI.sendTranscriptionComplete(politeText);
      } else {
        window.electronAPI.sendRecordingError({
          code: ERROR_CODES.TRANSCRIPTION_FAILED,
          message: "変換結果が空です",
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

  // 丁寧語変換中のキャンセル
  const handleConvertingCancel = useCallback(() => {
    isCancelledRef.current = true;
    window.electronAPI.sendConvertingCancelled();
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

    case "converting":
      return (
        <ConvertingOverlay
          rawText={rawText ?? ""}
          onCancel={handleConvertingCancel}
        />
      );

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
