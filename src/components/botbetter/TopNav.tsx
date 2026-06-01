import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export type ScreenKey = "landing" | "dashboard" | "chat" | "agent" | "agent-chat" | "connections" | "create";

const tabs: { key: ScreenKey; label: string }[] = [
  { key: "landing", label: "Landing" },
  { key: "dashboard", label: "Dashboard" },
  { key: "chat", label: "Nexus Chat" },
  { key: "agent", label: "Agent Detail" },
  { key: "connections", label: "Connections" },
  { key: "create", label: "Create Agent" },
];

export const TopNav = ({ active, onChange }: { active: ScreenKey; onChange: (s: ScreenKey) => void }) => {
  const { theme, toggle } = useTheme();
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#050510]/78 text-white shadow-[0_16px_60px_rgba(0,0,0,.25)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#06B6D4] shadow-[0_0_28px_rgba(99,102,241,.55)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-normal">BotBetter</span>
          <span className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100 sm:inline">
            Nexus OS
          </span>
        </div>

        <div className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.055] p-1 shadow-inner shadow-white/5 md:flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] transition",
                active === t.key
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-[0_0_18px_rgba(6,182,212,.26)]"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={toggle}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/[0.055] text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="flex items-center gap-1 overflow-x-auto px-2 pb-2 md:hidden scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] transition",
              active === t.key
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white"
                : "border border-white/10 text-slate-400"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};
