import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LayoutDashboard, Link2, LogOut, MessageSquare, Plus, Trash2, User } from "lucide-react";
import { chatAPI, userAPI, type ChatMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme, type NexusTheme } from "./ThemeProvider";
import type { ScreenKey } from "./TopNav";
import { APP_DESTINATIONS, LANGUAGES, type SidebarSession } from "./appShellData";
import { cn } from "@/lib/utils";

function sessionTitle(messages: ChatMessage[]) {
  const firstUser = messages.find((m) => m.role === "user");
  return (firstUser?.content ?? "New conversation").slice(0, 42);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60 * 1000) return "now";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupHistory(history: ChatMessage[]): SidebarSession[] {
  if (!history.length) return [];
  const sessions: ChatMessage[][] = [];
  let current: ChatMessage[] = [];

  for (const msg of history) {
    if (msg.role === "user" && current.length > 0) {
      const prev = current[current.length - 1];
      const gap = new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
      if (gap > 2 * 60 * 60 * 1000) {
        sessions.push(current);
        current = [];
      }
    }
    current.push(msg);
  }
  if (current.length) sessions.push(current);

  return sessions
    .map((messages) => {
      const first = messages.find((m) => m.role === "user") ?? messages[0];
      return {
        id: first.createdAt,
        title: sessionTitle(messages),
        date: first.createdAt,
        time: formatTime(first.createdAt),
        messages,
      };
    })
    .reverse();
}

export function BotBetterSidebar({
  active,
  onNavigate,
  onLogout,
  sessions,
  activeSessionId,
  onNewChat,
  onSessionClick,
  onDeleteSession,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  onLogout?: () => void;
  sessions?: SidebarSession[];
  activeSessionId?: string | null;
  onNewChat?: () => void;
  onSessionClick?: (session: SidebarSession) => void;
  onDeleteSession?: (session: SidebarSession) => void;
}) {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => (
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  ));
  const [menuOpen, setMenuOpen] = useState(false);
  const [recent, setRecent] = useState<SidebarSession[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessions || !user) return;
    chatAPI.getHistory("nexus").then((data) => setRecent(groupHistory(data.history))).catch(() => setRecent([]));
  }, [sessions, user]);

  const shownSessions = sessions ?? recent;
  const displayName = user?.name ?? "Guest";
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const plan = user?.plan === "free" ? "Beta" : user?.plan ?? "Beta";
  const currentVoice = user?.voice === "off" ? "Text only" : user?.personality === "kabir" || user?.voice === "male" ? "Kabir" : "Maya";

  const persist = async (patch: { language?: string; voice?: string; personality?: "maya" | "kabir"; theme?: NexusTheme }) => {
    updateUser(patch);
    if (patch.theme) setTheme(patch.theme);
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(patch);
      updateUser(res.user);
    } catch {
      // Keep the local instant change; backend failures are non-blocking in the menu.
    } finally {
      setSaving(false);
    }
  };

  const chooseVoice = (choice: "maya" | "kabir" | "off") => {
    if (choice === "off") void persist({ voice: "off" });
    if (choice === "maya") void persist({ voice: "female", personality: "maya" });
    if (choice === "kabir") void persist({ voice: "male", personality: "kabir" });
  };

  const handleNewChat = () => {
    if (onNewChat) onNewChat();
    else onNavigate("chat");
  };

  const handleSession = (session: SidebarSession) => {
    if (onSessionClick) onSessionClick(session);
    else onNavigate("chat");
  };

  const handleLogout = () => {
    (onLogout ?? logout)();
    setMenuOpen(false);
    onNavigate("landing");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-dvh shrink-0 flex-col border-r border-slate-800 bg-[#111111] text-slate-100 transition-[width] duration-200 md:sticky",
        collapsed ? "w-16" : "w-[220px]"
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="space-y-3 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-lg text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Collapse sidebar"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={handleNewChat}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-200",
              collapsed ? "w-10" : "w-full"
            )}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {!collapsed && <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recent chats</div>}
          <div className="space-y-1">
            {shownSessions.length === 0 && !collapsed ? (
              <div className="px-2 py-3 text-xs text-slate-500">{user ? "No chats yet" : "Log in to see chats"}</div>
            ) : (
              shownSessions.slice(0, 20).map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSession(session)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white",
                    activeSessionId === session.id && "bg-slate-800 text-white"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{session.title}</span>
                        <span className="block text-[11px] text-slate-500">{session.time}</span>
                      </span>
                      {onDeleteSession && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-md text-slate-500 opacity-0 hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="my-3 border-t border-slate-800" />

          <nav className="space-y-1">
            {APP_DESTINATIONS.map((item) => {
              const Icon = item.key === "dashboard" ? LayoutDashboard : Link2;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white",
                    active === item.key && "bg-slate-800 text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="relative border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-800"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-bold text-white">{initial}</span>
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{displayName}</span>
                <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-300">{plan}</span>
              </span>
            )}
          </button>

          {menuOpen && !collapsed && (
            <div className="absolute bottom-16 left-3 right-3 z-50 rounded-xl border border-slate-700 bg-[#191919] p-2 shadow-2xl">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800" onClick={() => onNavigate("dashboard")}>
                <User className="h-4 w-4" /> Profile settings
              </button>

              <label className="mt-2 block px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Language</label>
              <select
                value={user?.language ?? "en-IN"}
                onChange={(e) => void persist({ language: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
              >
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>

              <label className="mt-2 block px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Voice</label>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {(["maya", "kabir", "off"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => chooseVoice(v)}
                    className={cn(
                      "rounded-lg border border-slate-700 px-2 py-2 text-xs hover:bg-slate-800",
                      ((v === "off" && currentVoice === "Text only") || (v === "maya" && currentVoice === "Maya") || (v === "kabir" && currentVoice === "Kabir")) && "border-cyan-400 text-cyan-300"
                    )}
                  >
                    {v === "off" ? "Text" : v[0].toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              <label className="mt-2 block px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Theme</label>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {(["nexus", "void", "genz"] as NexusTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => void persist({ theme: t })}
                    className={cn("rounded-lg border border-slate-700 px-2 py-2 text-xs capitalize hover:bg-slate-800", theme === t && "border-cyan-400 text-cyan-300")}
                  >
                    {t === "genz" ? "Gen Z" : t}
                  </button>
                ))}
              </div>

              <button className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </button>
              {saving && <div className="px-3 pb-1 pt-2 text-[11px] text-slate-500">Saving...</div>}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function BotBetterShell({
  active,
  onNavigate,
  onLogout,
  title,
  children,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  onLogout?: () => void;
  title?: string;
  children: ReactNode;
}) {
  const sidebar = useMemo(() => <BotBetterSidebar active={active} onNavigate={onNavigate} onLogout={onLogout} />, [active, onNavigate, onLogout]);

  return (
    <div className="min-h-dvh bg-[#f7f7f5] text-slate-950 md:flex">
      {sidebar}
      <main className="min-h-dvh flex-1 pl-16 md:pl-0">
        {title && (
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-[#f7f7f5]/95 px-5 py-4 backdrop-blur">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
