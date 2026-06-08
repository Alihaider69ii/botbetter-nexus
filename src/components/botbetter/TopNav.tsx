import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { useTheme, ThemeSwitcher } from "./ThemeProvider";
import { useVoiceMode } from "@/context/VoiceModeContext";

export type ScreenKey = "landing" | "dashboard" | "chat" | "agent" | "agent-chat" | "connections" | "create";

export const TopNav = ({ active, onChange }: { active: ScreenKey; onChange: (s: ScreenKey) => void }) => {
  const { theme } = useTheme();
  const { voiceMode, toggleVoiceMode } = useVoiceMode();

  const isDark = theme !== "genz";

  return (
    <div
      className="sticky top-0 z-50 border-b shadow-sm backdrop-blur-md"
      style={{
        background: isDark ? "rgba(2,5,16,0.93)" : "rgba(255,255,255,0.93)",
        borderColor: isDark ? "rgba(0,212,255,0.13)" : "#E5E7EB",
        color: isDark ? "#E0F7FF" : "#0A0A0F",
      }}
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-8 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange("landing")}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] shadow-lg shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ color: isDark ? "#E0F7FF" : "#0A0A0F" }}>
            BotBetter
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button
            onClick={toggleVoiceMode}
            className="grid h-9 w-9 place-items-center rounded-full border transition"
            style={{
              borderColor: voiceMode
                ? "rgba(255,60,172,0.35)"
                : isDark ? "rgba(0,212,255,0.2)" : "#E5E7EB",
              background: voiceMode
                ? "rgba(255,60,172,0.08)"
                : isDark ? "rgba(0,212,255,0.04)" : "#F9F9F9",
              color: voiceMode ? "#FF3CAC" : isDark ? "#00D4FF" : "#6C00FF",
            }}
            aria-label={voiceMode ? "Turn voice mode off" : "Turn voice mode on"}
          >
            {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
