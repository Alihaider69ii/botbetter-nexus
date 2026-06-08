import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

  const setTheme = (t: NexusTheme) => setThemeState(t);

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
    <div style={{ display: "flex", gap: 6, alignItems: "center", ...style }}>
      {options.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          title={labels[t]}
          aria-label={`Switch to ${labels[t]} theme`}
          style={{
            width: 13, height: 13, borderRadius: "50%",
            background: THEME_COLORS[t],
            border: theme === t ? "2px solid rgba(255,255,255,0.95)" : "2px solid rgba(255,255,255,0.18)",
            cursor: "pointer", padding: 0,
            boxShadow: theme === t ? `0 0 8px ${THEME_COLORS[t]}` : "none",
            transition: "all .18s", flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
};
