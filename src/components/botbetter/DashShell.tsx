import { ReactNode, useState, useRef, useEffect } from "react";
import { LayoutDashboard, Plug, BarChart3, LogOut, Sparkles, Plus, ArrowLeft, ChevronDown, User } from "lucide-react";
import { ScreenKey } from "./TopNav";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "./ThemeProvider";

export const DashShell = ({
  active,
  onNavigate,
  title,
  children,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  title?: string;
  children: ReactNode;
}) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme !== "genz";
  const displayName = user?.name?.split(" ")[0] ?? "You";
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" as ScreenKey },
    { label: "Connectors", icon: Plug, key: "connections" as ScreenKey },
    { label: "Usage", icon: BarChart3, key: "usage" as ScreenKey },
  ];

  const bg = isDark ? "#020510" : "#FFFFFF";
  const sidebarBg = isDark ? "rgba(2,5,16,0.98)" : "#FAFAFA";
  const border = isDark ? "rgba(0,212,255,0.12)" : "#E5E7EB";
  const accent = isDark ? "#00D4FF" : "#6C00FF";
  const textMain = isDark ? "#E0F7FF" : "#0A0A0F";
  const textMuted = isDark ? "rgba(224,247,255,0.45)" : "#6B7280";
  const surface = isDark ? "rgba(0,212,255,0.06)" : "rgba(108,0,255,0.04)";
  const activeBg = isDark ? "rgba(0,212,255,0.12)" : "rgba(108,0,255,0.08)";
  const activeBorder = isDark ? "rgba(0,212,255,0.25)" : "rgba(108,0,255,0.2)";
  const headerBg = isDark ? "rgba(2,5,16,0.95)" : "rgba(255,255,255,0.95)";

  return (
    <div className="flex min-h-screen w-full" style={{ background: bg }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col fixed top-0 left-0 h-screen z-20"
        style={{ background: sidebarBg, borderRight: `1px solid ${border}` }}
      >
        {/* Logo + Back to Nexus */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-2.5 px-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] grid place-items-center shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[16px] tracking-tight" style={{ color: textMain }}>BotBetter</span>
          </div>
          <button
            onClick={() => onNavigate("chat")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5"
            style={{
              color: accent,
              background: activeBg,
              border: `1px solid ${activeBorder}`,
              boxShadow: isDark ? "0 2px 12px rgba(0,212,255,0.1)" : "0 2px 12px rgba(108,0,255,0.08)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            ← Back to Nexus
          </button>
        </div>

        {/* + New Chat */}
        <div className="px-4 py-4" style={{ borderBottom: `1px solid ${border}` }}>
          <button
            onClick={() => onNavigate("chat")}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #00D4FF, rgba(0,180,220,0.85))"
                : "linear-gradient(135deg, #6C00FF, #FF3CAC)",
              color: isDark ? "#020510" : "#FFFFFF",
              boxShadow: isDark ? "0 4px 16px rgba(0,212,255,0.25)" : "0 4px 16px rgba(108,0,255,0.2)",
            }}
          >
            <Plus className="h-4 w-4" />
            + New Chat
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((it) => {
            const isActive = it.key === active;
            return (
              <button
                key={it.label}
                onClick={() => onNavigate(it.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all"
                style={{
                  color: isActive ? accent : textMuted,
                  background: isActive ? activeBg : "transparent",
                  border: isActive ? `1px solid ${activeBorder}` : "1px solid transparent",
                  fontWeight: isActive ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = surface;
                    el.style.color = textMain;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = textMuted;
                  }
                }}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </button>
            );
          })}
        </nav>

        {/* User avatar bottom with dropdown */}
        <div className="p-3" style={{ borderTop: `1px solid ${border}` }} ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{ background: surface, border: `1px solid ${border}` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = border; }}
            >
              <div
                className="h-8 w-8 rounded-full grid place-items-center text-[12px] font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #6C00FF, #FF3CAC)", color: "#fff" }}
              >
                {initial}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[13px] font-semibold truncate" style={{ color: textMain }}>{displayName}</div>
                <div className="text-[11px] truncate" style={{ color: textMuted }}>{user?.email}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: textMuted }} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden z-50"
                style={{
                  background: isDark ? "#030812" : "#FFFFFF",
                  border: `1px solid ${border}`,
                  boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                <button
                  onClick={() => { setDropdownOpen(false); onNavigate("dashboard"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-all"
                  style={{ color: textMain }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = surface; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-all"
                  style={{ color: "#FF3CAC" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,60,172,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content — offset for fixed sidebar on md+ */}
      <main className="flex-1 min-w-0 md:ml-60 flex flex-col min-h-screen">
        {/* Sticky header with Back to Nexus */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3 backdrop-blur-md"
          style={{ background: headerBg, borderBottom: `1px solid ${border}` }}
        >
          <button
            onClick={() => onNavigate("chat")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: accent }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Nexus
          </button>
          {title && (
            <span className="text-xs font-semibold" style={{ color: textMuted }}>/ {title}</span>
          )}
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
};
