import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface VoiceModeContextValue {
  voiceMode: boolean;
  toggleVoiceMode: () => void;
}

const VoiceModeContext = createContext<VoiceModeContextValue | null>(null);

export const VoiceModeProvider = ({ children }: { children: ReactNode }) => {
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem("bb_voice_mode") === "true");

  useEffect(() => {
    localStorage.setItem("bb_voice_mode", String(voiceMode));
  }, [voiceMode]);

  return (
    <VoiceModeContext.Provider value={{ voiceMode, toggleVoiceMode: () => setVoiceMode((v) => !v) }}>
      {children}
    </VoiceModeContext.Provider>
  );
};

export const useVoiceMode = () => {
  const ctx = useContext(VoiceModeContext);
  if (!ctx) throw new Error("useVoiceMode must be used inside VoiceModeProvider");
  return ctx;
};
