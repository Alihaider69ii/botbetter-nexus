import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, Send, Square } from "lucide-react";
import { BotBetterSidebar } from "../BotBetterSidebar";
import type { SidebarSession } from "../appShellData";
import type { ScreenKey } from "../TopNav";
import { chatAPI, type ChatMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useVoiceChat, playBase64Audio } from "@/hooks/use-voice-chat";
import { AuthModal } from "./AuthModal";

type Msg = { from: "user"; text: string } | { from: "nexus"; text: string };
type Session = SidebarSession & { messages: Msg[] };

const SEED: Msg[] = [
  {
    from: "nexus",
    text: "Hi, I am Nexus. Ask me anything, or tell me what you want to get done.",
  },
];

function historyToMsgs(history: ChatMessage[]): Msg[] {
  return history.map((m) => (
    m.role === "user" ? { from: "user", text: m.content } : { from: "nexus", text: m.content }
  ));
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

function groupIntoSessions(history: ChatMessage[]): Session[] {
  if (!history.length) return [];
  const groups: ChatMessage[][] = [];
  let current: ChatMessage[] = [];

  for (const msg of history) {
    if (msg.role === "user" && current.length > 0) {
      const prev = current[current.length - 1];
      const gap = new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
      if (gap > 2 * 60 * 60 * 1000) {
        groups.push(current);
        current = [];
      }
    }
    current.push(msg);
  }
  if (current.length) groups.push(current);

  return groups
    .map((messages) => {
      const first = messages.find((m) => m.role === "user") ?? messages[0];
      return {
        id: first.createdAt,
        title: (first.content || "New conversation").slice(0, 42),
        date: first.createdAt,
        time: formatTime(first.createdAt),
        messages: historyToMsgs(messages),
      };
    })
    .reverse();
}

export const NexusChat = ({
  active,
  onNavigate,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
}) => {
  const { user, logout } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "signup" }>({ open: false, tab: "login" });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const language = user?.language ?? "en-IN";
  const personality = user?.personality ?? (user?.voice === "male" ? "kabir" : "maya");
  const voiceOn = user?.voice !== "off";
  const userInitial = user?.name?.[0]?.toUpperCase() ?? "U";

  const refreshHistory = useCallback(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    chatAPI.getHistory("nexus").then((data) => setSessions(groupIntoSessions(data.history))).catch(() => null);
  }, [user]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, sending]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    if (!user) {
      setAuthModal({ open: true, tab: "login" });
      return;
    }

    setInput("");
    setSendError("");
    setMsgs((prev) => [...prev, { from: "user", text }]);
    setSending(true);

    try {
      const token = localStorage.getItem("bb_token") ?? "";
      const res = await fetch("/api/chat/nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, personality, language, tts: voiceOn }),
      });
      const data = await res.json() as { reply?: string; audioBase64?: string; message?: string; limitReached?: boolean };

      if (!res.ok) {
        if (data.limitReached) {
          setMsgs((prev) => prev.slice(0, -1));
          setInput(text);
          setSendError("Daily message limit reached. Refer a friend for +20 bonus messages.");
          return;
        }
        throw new Error(data.message ?? "Message failed");
      }

      setMsgs((prev) => [...prev, { from: "nexus", text: data.reply ?? "" }]);
      if (voiceOn && data.audioBase64) void playBase64Audio(data.audioBase64);
      refreshHistory();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong");
      setMsgs((prev) => [...prev, { from: "nexus", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  const voiceHook = useVoiceChat({
    language,
    personality,
    onResult: (data) => {
      setMsgs((prev) => [
        ...prev,
        { from: "user", text: data.transcript },
        { from: "nexus", text: data.reply },
      ]);
      refreshHistory();
    },
    onError: (message) => setSendError(message),
  });

  const loadSession = (session: SidebarSession) => {
    const found = sessions.find((s) => s.id === session.id);
    if (!found) return;
    setActiveSessionId(found.id);
    setMsgs(found.messages.length ? found.messages : SEED);
  };

  const deleteSession = (session: SidebarSession) => {
    setSessions((prev) => prev.filter((item) => item.id !== session.id));
    if (activeSessionId === session.id) {
      setActiveSessionId(null);
      setMsgs(SEED);
    }
  };

  const newChat = () => {
    setActiveSessionId(null);
    setMsgs(SEED);
    setInput("");
    setSendError("");
  };

  const placeholder = useMemo(() => (
    user ? "Ask Nexus anything..." : "Log in to chat with Nexus"
  ), [user]);

  return (
    <>
      <div className="min-h-dvh bg-[#f7f7f5] text-slate-950 md:flex">
        <BotBetterSidebar
          active={active}
          onNavigate={onNavigate}
          onLogout={logout}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={newChat}
          onSessionClick={loadSession}
          onDeleteSession={deleteSession}
        />

        <main className="flex min-h-dvh flex-1 flex-col pl-16 md:pl-0">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-[#f7f7f5]/95 px-4 backdrop-blur sm:px-6">
            <div>
              <div className="text-sm font-semibold">Nexus</div>
              <div className="text-xs text-slate-500">{voiceOn ? `Voice: ${personality === "kabir" ? "Kabir" : "Maya"}` : "Text only"}</div>
            </div>
            {!user && (
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-white" onClick={() => setAuthModal({ open: true, tab: "login" })}>Log in</button>
                <button className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800" onClick={() => setAuthModal({ open: true, tab: "signup" })}>Sign up</button>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {msgs.map((msg, idx) => (
                <div key={`${msg.from}-${idx}`} className={msg.from === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={msg.from === "user" ? "flex max-w-[82%] items-start gap-3" : "flex max-w-[82%] items-start gap-3"}>
                    {msg.from === "nexus" && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white">N</div>}
                    <div className={msg.from === "user" ? "rounded-2xl bg-slate-950 px-4 py-3 text-sm leading-6 text-white" : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm"}>
                      {msg.text}
                    </div>
                    {msg.from === "user" && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-800">{userInitial}</div>}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white">N</div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-[#f7f7f5] px-4 py-3 sm:px-8">
            <div className="mx-auto max-w-3xl">
              {sendError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {sendError}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm">
                {voiceOn && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setAuthModal({ open: true, tab: "login" });
                        return;
                      }
                      voiceHook.toggleRecording();
                    }}
                    disabled={voiceHook.processing || sending}
                    className={voiceHook.recording ? "grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-white" : "grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"}
                    aria-label={voiceHook.recording ? "Stop recording" : "Voice input"}
                  >
                    {voiceHook.recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                )}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  disabled={sending}
                  placeholder={placeholder}
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        onSuccess={() => setAuthModal((s) => ({ ...s, open: false }))}
      />
    </>
  );
};
