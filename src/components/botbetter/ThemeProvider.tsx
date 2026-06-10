import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type NexusTheme = "nexus" | "void" | "genz";

const THEME_COLORS: Record<NexusTheme, string> = {
  nexus: "#00D4FF",
  void:  "#7C6BFF",
  genz:  "#FF3CAC",
};

interface ThemeContextValue {
  theme: NexusTheme;
  setTheme: (t: NexusTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "nexus", setTheme: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<NexusTheme>(() => {
    const s = localStorage.getItem("bb_theme") as NexusTheme | null;
    return s && ["nexus", "void", "genz"].includes(s) ? s : "nexus";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("bb_theme", theme);
    // Keep Tailwind dark mode in sync (nexus/void = dark, genz = light)
    root.classList.toggle("dark", theme !== "genz");
  }, [theme]);

  const setTheme = useCallback((t: NexusTheme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Reusable 3-dot theme switcher — works on any background
export const ThemeSwitcher = ({ style = {} }: { style?: React.CSSProperties }) => {
  const { theme, setTheme } = useTheme();
  const options: NexusTheme[] = ["nexus", "void", "genz"];
  const labels: Record<NexusTheme, string> = { nexus: "NEXUS (Dark)", void: "VOID (Black)", genz: "GEN Z (Light)" };
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", ...style }}>
      {options.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          title={labels[t]}
          aria-label={`Switch to ${labels[t]} theme`}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "transparent",
            border: "none",
            cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            background: THEME_COLORS[t],
            border: theme === t ? "2.5px solid rgba(255,255,255,0.95)" : "2px solid rgba(255,255,255,0.2)",
            boxShadow: theme === t ? `0 0 10px ${THEME_COLORS[t]}, 0 0 3px ${THEME_COLORS[t]}` : "none",
            transition: "all .18s",
            transform: theme === t ? "scale(1.2)" : "scale(1)",
            pointerEvents: "none",
          }} />
        </button>
      ))}
    </div>
  );
};
