import { useRef, useState } from "react";
import { voiceAPI, ApiError, type VoiceChatResponse } from "@/services/api";

function playBase64Audio(audioBase64: string) {
  if (!audioBase64) return;
  const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
  void audio.play();
}

export function useVoiceChat({
  language,
  onResult,
  onError,
}: {
  language: string;
  onResult: (data: VoiceChatResponse) => void;
  onError: (message: string, err: unknown) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const options = MediaRecorder.isTypeSupported("audio/webm") ? { mimeType: "audio/webm" } : undefined;
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);

        const audio = new Blob(chunksRef.current, { type: "audio/webm" });
        if (!audio.size) return;

        setProcessing(true);
        try {
          const data = await voiceAPI.sendVoiceChat(audio, language);
          playBase64Audio(data.audioBase64);
          onResult(data);
        } catch (err) {
          const message =
            err instanceof ApiError && err.data.limitReached
              ? "Daily message limit reached. Come back tomorrow or refer a friend for +20 messages!"
              : err instanceof Error
                ? err.message
                : "Voice chat failed";
          onError(message, err);
        } finally {
          setProcessing(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Microphone permission denied";
      onError(message, err);
    }
  };

  const toggleRecording = () => {
    if (processing) return;
    if (recording) {
      stopRecording();
      return;
    }
    void startRecording();
  };

  return { recording, processing, toggleRecording };
}
