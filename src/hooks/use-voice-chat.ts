import { useRef, useState } from "react";
import { voiceAPI, ApiError, type VoiceChatResponse } from "@/services/api";

async function playBase64Audio(audioBase64: string) {
  if (!audioBase64) {
    console.warn("[Voice] audioBase64 is empty — TTS returned no audio");
    return;
  }
  console.log("[Voice] playing audio, base64 length:", audioBase64.length);

  for (const mime of ["audio/wav", "audio/mpeg", "audio/ogg"]) {
    try {
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      await audio.play();
      return;
    } catch (e) {
      console.warn(`[Voice] play failed with ${mime}:`, (e as Error).message);
    }
  }
}

export function useVoiceChat({
  language,
  personality = "maya",
  onResult,
  onError,
}: {
  language: string;
  personality?: string;
  onResult: (data: VoiceChatResponse) => void;
  onError: (message: string, err: unknown) => void;
}) {
  const [recording,   setRecording]   = useState(false);
  const [processing,  setProcessing]  = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<BlobPart[]>([]);

  const stopRecording = () => { recorderRef.current?.stop(); };

  const startRecording = async () => {
    try {
      const stream  = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          const data = await voiceAPI.sendVoiceChat(audio, language, personality);
          console.log("[Voice] API response audioBase64 length:", data.audioBase64?.length ?? 0);
          await playBase64Audio(data.audioBase64);
          onResult(data);
        } catch (err) {
          const rawMessage =
            err instanceof ApiError && err.data.limitReached
              ? "Daily message limit reached. Come back tomorrow or refer a friend for +20 messages!"
              : err instanceof Error
                ? err.message
                : "Voice chat failed";
          const message =
            typeof rawMessage === "string" && rawMessage && rawMessage !== "[object Object]"
              ? rawMessage
              : "Voice chat failed. Please try again.";
          onError(message, err);
        } finally {
          setProcessing(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      const message =
        typeof rawMessage === "string" && rawMessage && rawMessage !== "[object Object]"
          ? rawMessage
          : "Microphone permission denied. Please allow mic access and try again.";
      onError(message, err);
    }
  };

  const toggleRecording = () => {
    if (processing) return;
    if (recording) { stopRecording(); return; }
    void startRecording();
  };

  return { recording, processing, toggleRecording };
}

export { playBase64Audio };
