import { Moon, Sun, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useVoiceMode } from "@/context/VoiceModeContext";

export type ScreenKey = "landing" | "dashboard" | "chat" | "agent" | "agent-chat" | "connections" | "create";

export const TopNav = ({ active, onChange }: { active: ScreenKey; onChange: (s: ScreenKey) => void }) => {
  const { theme, toggle } = useTheme();
  const { voiceMode, toggleVoiceMode } = useVoiceMode();
  
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 text-slate-900 shadow-sm backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 sm:px-8 max-w-[1400px] mx-auto">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onChange("landing")}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] shadow-lg shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">BotBetter</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleVoiceMode}
            className={`grid h-10 w-10 place-items-center rounded-full border transition ${
              voiceMode
                ? "border-red-200 bg-red-50 text-red-600 shadow-sm"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
            }`}
            aria-label={voiceMode ? "Turn voice mode off" : "Turn voice mode on"}
            title={voiceMode ? "Voice mode on" : "Voice mode off"}
          >
            {voiceMode ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            onClick={toggle}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
