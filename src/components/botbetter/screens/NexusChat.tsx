import { useState, useEffect, useRef } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import {
  Send, Settings2, Plus, MessageSquare, Mail, Calendar,
  Mic, Paperclip, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI, ApiError } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

type Msg =
  | { from: "user"; text: string }
  | { from: "nexus"; text: string; routes?: string[] };

const seed: Msg[] = [
  {
    from: "nexus",
    text: "Hey! Main Nexus hoon ⚡ — aapka master AI agent. Koi bhi kaam batao — main sahi specialist ko route karunga aur kaam karwa ke dunga.\n\nExample:\n• \"10kg lose karna hai\" → FlexAI\n• \"TCS interview prep\" → Prepify\n• \"NEET physics\" → Cracky\n• \"SIP calculate karo\" → Finio",
  },
];

const recentChats = ["Interview + email tasks", "Budget review June", "Reel ideas for Diwali"];

export const NexusChat = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const nexus = agents[0];
  const { user } = useAuth();

  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSendError("");
    setMsgs((m) => [...m, { from: "user", text }]);
    setSending(true);

    if (!user) {
      setMsgs((m) => [
        ...m,
        { from: "nexus", text: "Please log in to use Nexus. Tap the login button to get started! 👇" },
      ]);
      setSending(false);
      return;
    }

    try {
      const data = await chatAPI.sendMessage("nexus", text);
      setMsgs((m) => [...m, { from: "nexus", text: data.reply }]);
    } catch (err) {
      if (err instanceof ApiError && err.data.limitReached) {
        setMsgs((m) => m.slice(0, -1));
        setInput(text);
        setSendError("Daily message limit reached. Come back tomorrow or refer a friend for +20 messages!");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to get response";
        setSendError(msg);
        setMsgs((m) => [...m, { from: "nexus", text: "Sorry, something went wrong. Please try again! 🙏" }]);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Nexus Chat">
      <div className="flex h-[calc(100vh-4rem)] min-h-0 bg-slate-50">
        {/* Conversation history */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r-2 border-slate-100 bg-white shadow-sm z-10">
          <div className="p-4 border-b-2 border-slate-100">
            <button
              onClick={() => setMsgs(seed)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-2">RECENT</div>
            {recentChats.map((t, i) => (
              <button
                key={t}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  i === 0 ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Header */}
          <div className="h-20 border-b-2 border-slate-100 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl grid place-items-center text-xl shadow-sm"
                style={{ background: `${nexus.color}15`, border: `2px solid ${nexus.color}30` }}
              >
                {nexus.emoji}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 leading-tight">Nexus — Master Agent</div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-600 uppercase mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate("connections")}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Settings2 className="h-4 w-4" /> Connections
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto scrollbar-thin p-4 sm:p-8 space-y-6">
            {msgs.map((m, i) => {
              if (m.from === "user") {
                return (
                  <div key={i} className="flex justify-end animate-fade-in">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white px-6 py-4 text-sm font-medium shadow-md whitespace-pre-line">
                      {m.text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="flex gap-4 animate-fade-in">
                  <div
                    className="h-10 w-10 rounded-xl grid place-items-center text-base shrink-0 shadow-sm mt-1"
                    style={{ background: `${nexus.color}15`, border: `2px solid ${nexus.color}30` }}
                  >
                    {nexus.emoji}
                  </div>
                  <div className="max-w-[80%] space-y-3">
                    <div className="rounded-2xl rounded-tl-sm border-2 border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-700 shadow-sm whitespace-pre-line leading-relaxed">
                      {m.text}
                    </div>
                    {m.routes && (
                      <div className="flex flex-wrap gap-2">
                        {m.routes.map((r) => (
                          <span
                            key={r}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-700 uppercase tracking-widest"
                          >
                            → {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex gap-4 animate-fade-in">
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center text-base shrink-0 shadow-sm"
                  style={{ background: `${nexus.color}15`, border: `2px solid ${nexus.color}30` }}
                >
                  {nexus.emoji}
                </div>
                <div className="rounded-2xl rounded-tl-sm border-2 border-slate-200 bg-white px-6 py-4 flex items-center gap-2 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {sendError && (
            <div className="px-6 py-3 flex items-center gap-3 border-t-2 border-slate-100 bg-red-50 text-xs font-bold text-red-600 z-10">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {sendError}
              <button onClick={() => setSendError("")} className="ml-auto text-[10px] uppercase tracking-widest underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Active tools */}
          <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-t-2 border-slate-100 bg-white shrink-0 z-10">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ROUTES TO</span>
            {[
              { name: "FlexAI", color: "#FF6B35" },
              { name: "Finio", color: "#1D9E75" },
              { name: "Prepify", color: "#1D9E75" },
              { name: "Cracky", color: "#F59E0B" },
              { name: "Creato", color: "#D4537E" },
              { name: "Sellio", color: "#D85A30" },
              { name: "Buddy", color: "#7C6BFF" },
            ].map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border-2 uppercase tracking-widest"
                style={{ borderColor: `${t.color}30`, background: `${t.color}10`, color: t.color }}
              >
                {t.name}
              </span>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 bg-white shrink-0">
            <div className="flex items-end gap-3 rounded-3xl border-2 border-slate-200 bg-white p-2 shadow-sm focus-within:border-[#6C00FF] focus-within:shadow-md transition-all">
              <button className="h-10 w-10 grid place-items-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors mb-1 ml-1">
                <Paperclip className="h-5 w-5" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={!user ? "LOG IN TO USE NEXUS..." : "ASK NEXUS TO DO ANYTHING..."}
                className="flex-1 resize-none bg-transparent outline-none text-sm font-bold tracking-widest text-slate-900 py-3.5 px-2 max-h-32 placeholder:text-slate-300 placeholder:font-bold"
                disabled={sending}
              />
              <button className="h-10 w-10 grid place-items-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors mb-1">
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="h-12 w-12 grid place-items-center rounded-2xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 mb-0.5 mr-0.5"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            {!user && (
              <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                <button onClick={() => onNavigate("landing")} className="text-[#6C00FF] hover:underline">
                  Log in
                </button>
                {" "}to unlock Nexus — your master AI agent
              </p>
            )}
          </div>
        </div>
      </div>
    </DashShell>
  );
};
