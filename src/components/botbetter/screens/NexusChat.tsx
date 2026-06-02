import { useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { Send, Settings2, Plus, MessageSquare, Mail, Calendar, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg =
  | { from: "user"; text: string }
  | { from: "nexus"; text: string; routes?: string[] }
  | { from: "agent"; agent: string; text: string };

const seed: Msg[] = [
  { from: "user", text: "Aaj interview hai aur client ko email bhi bhejni hai" },
  {
    from: "nexus",
    text: "Got it! Routing to Prepify for interview prep + using Gmail to draft your email...",
    routes: ["Prepify", "Gmail"],
  },
  {
    from: "agent",
    agent: "Prepify",
    text: "Mock interview ready — 5 questions for Senior PM role at Razorpay. Want to start?",
  },
  {
    from: "agent",
    agent: "Gmail",
    text: "Drafted email to client@acme.com — Subject: 'Project update — milestone 2'. Review before send?",
  },
];

export const NexusChat = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const nexus = agents[0];
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(seed);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [
      ...m,
      { from: "user", text: input },
      {
        from: "nexus",
        text: "On it. Analyzing your request and routing to the right specialist...",
        routes: ["Buddy"],
      },
    ]);
    setInput("");
  };

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Nexus Chat">
      <div className="flex h-[calc(100vh-4rem)] min-h-0 bg-slate-50">
        {/* Conversation history */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r-2 border-slate-100 bg-white shadow-sm z-10">
          <div className="p-4 border-b-2 border-slate-100">
            <button className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-2">TODAY</div>
            {["Interview + email tasks", "Plan launch week", "Budget review June"].map((t, i) => (
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
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-2 mt-6">YESTERDAY</div>
            {["Reel ideas for Diwali", "Tax saving Q2", "Customer reply drafts"].map((t) => (
              <button
                key={t}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
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
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Routing Active
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
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white px-6 py-4 text-sm font-medium shadow-md">
                      {m.text}
                    </div>
                  </div>
                );
              }
              if (m.from === "nexus") {
                return (
                  <div key={i} className="flex gap-4 animate-fade-in">
                    <div
                      className="h-10 w-10 rounded-xl grid place-items-center text-base shrink-0 shadow-sm"
                      style={{ background: `${nexus.color}15`, border: `2px solid ${nexus.color}30` }}
                    >
                      {nexus.emoji}
                    </div>
                    <div className="max-w-[80%] space-y-3">
                      <div className="rounded-2xl rounded-tl-sm border-2 border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-700 shadow-sm">
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
              }
              const a = agents.find((x) => x.name === m.agent);
              const isApp = !a;
              const color = a?.color ?? "#7C6BFF";
              return (
                <div key={i} className="flex gap-4 animate-fade-in">
                  <div
                    className="h-10 w-10 rounded-xl grid place-items-center text-base shrink-0 shadow-sm"
                    style={{ background: `${color}15`, border: `2px solid ${color}30` }}
                  >
                    {a?.emoji ?? (m.agent === "Gmail" ? <Mail className="h-5 w-5 text-[#EA4335]" /> : <MessageSquare className="h-5 w-5 text-[#25D366]" />)}
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-6 pt-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md border-2 uppercase tracking-widest" style={{ borderColor: `${color}40`, color }}>
                        {isApp ? "APP" : "AGENT"} · {m.agent}
                      </span>
                    </div>
                    <div className="px-6 pb-4 pt-3 text-sm font-medium text-slate-700">{m.text}</div>
                    {!isApp && (
                      <div className="px-6 pb-4 flex gap-3">
                        <button className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                          Continue
                        </button>
                        <button className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">Skip</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active tools */}
          <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-t-2 border-slate-100 bg-white shrink-0 z-10">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ACTIVE TOOLS</span>
            {[
              { name: "WhatsApp", icon: MessageSquare, color: "#25D366" },
              { name: "Gmail", icon: Mail, color: "#EA4335" },
              { name: "Calendar", icon: Calendar, color: "#1967D2" },
            ].map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border-2 uppercase tracking-widest"
                style={{ borderColor: `${t.color}30`, background: `${t.color}10`, color: t.color }}
              >
                <t.icon className="h-3 w-3" /> {t.name}
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
                placeholder="ASK NEXUS TO DO ANYTHING..."
                className="flex-1 resize-none bg-transparent outline-none text-sm font-bold tracking-widest text-slate-900 py-3.5 px-2 max-h-32 placeholder:text-slate-300 placeholder:font-bold"
              />
              <button className="h-10 w-10 grid place-items-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors mb-1">
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={send}
                className="h-12 w-12 grid place-items-center rounded-2xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mb-0.5 mr-0.5"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
};
