import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export type ScreenKey = "landing" | "dashboard" | "chat" | "agent" | "connections" | "create";

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
    <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary grid place-items-center glow-purple">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-medium tracking-tight">BotBetter</span>
          <span className="label-xs text-muted-foreground hidden sm:inline ml-1 px-1.5 py-0.5 rounded border border-border">WIREFRAME</span>
        </div>

        <div className="hidden md:flex items-center gap-0.5 p-1 rounded-full border border-border bg-card/50">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[13px] transition-colors",
                active === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={toggle}
          className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex items-center gap-1 px-2 pb-2 overflow-x-auto scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-[12px] transition-colors",
              active === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground border border-border"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};
