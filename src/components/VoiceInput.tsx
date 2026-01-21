import { useCallback, useEffect, useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

type TranscribeResponse = {
  text?: string;
  error?: string;
};

export const VoiceInput = () => {
  const {
    state,
    error: recordError,
    startRecording,
    stopRecording,
    audioBlob,
  } = useAudioRecorder();
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const transcribe = useCallback(async (blob: Blob) => {
    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("http://localhost:3001/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data: TranscribeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      if (data.text) {
        setTranscribedText((prev) =>
          prev ? `${prev}\n${data.text}` : data.text,
        );
      }
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : "Transcription failed",
      );
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  useEffect(() => {
    if (audioBlob) {
      transcribe(audioBlob);
    }
  }, [audioBlob, transcribe]);

  const handleButtonClick = useCallback(() => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle") {
      startRecording();
    }
  }, [state, startRecording, stopRecording]);

  const isDisabled = state === "processing" || isTranscribing;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Voice Input</h2>

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`px-6 py-3 rounded-full font-medium transition-colors ${
          state === "recording"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state === "recording"
          ? "Stop Recording"
          : state === "processing" || isTranscribing
            ? "Processing..."
            : "Start Recording"}
      </button>

      {state === "recording" && (
        <p className="mt-2 text-red-500 animate-pulse">Recording...</p>
      )}

      {(recordError || transcribeError) && (
        <p className="mt-2 text-red-500">
          Error: {recordError || transcribeError}
        </p>
      )}

      {transcribedText && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Transcribed Text:</h3>
          <div className="bg-white border rounded p-3 whitespace-pre-wrap">
            {transcribedText}
          </div>
        </div>
      )}
    </div>
  );
};
