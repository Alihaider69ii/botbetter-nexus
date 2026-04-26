import { useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { Send, Settings2, Plus, MessageSquare, Mail, Calendar, Mic, Paperclip } from "lucide-react";

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
      <div className="flex h-[calc(100vh-7rem)] min-h-0">
        {/* Conversation history */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/50">
          <div className="p-3 border-b border-sidebar-border">
            <button className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-[12px]">
              <Plus className="h-3.5 w-3.5" /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1">
            <div className="label-xs text-muted-foreground px-2 py-1">TODAY</div>
            {["Interview + email tasks", "Plan launch week", "Budget review June"].map((t, i) => (
              <button
                key={t}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition ${
                  i === 0 ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-sidebar-accent"
                }`}
              >
                {t}
              </button>
            ))}
            <div className="label-xs text-muted-foreground px-2 py-1 pt-3">YESTERDAY</div>
            {["Reel ideas for Diwali", "Tax saving Q2", "Customer reply drafts"].map((t) => (
              <button
                key={t}
                className="w-full text-left px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-sidebar-accent"
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 rounded-lg grid place-items-center text-base"
                style={{ background: `${nexus.color}22`, border: `1px solid ${nexus.color}40` }}
              >
                {nexus.emoji}
              </div>
              <div>
                <div className="text-[14px] font-medium leading-tight">Nexus — Master Agent</div>
                <div className="inline-flex items-center gap-1 label-xs text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" /> ROUTING ACTIVE
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate("connections")}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-border hover:bg-secondary"
            >
              <Settings2 className="h-3.5 w-3.5" /> Manage connections
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto scrollbar-thin p-4 sm:p-6 space-y-4">
            {msgs.map((m, i) => {
              if (m.from === "user") {
                return (
                  <div key={i} className="flex justify-end fade-in">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-[14px]">
                      {m.text}
                    </div>
                  </div>
                );
              }
              if (m.from === "nexus") {
                return (
                  <div key={i} className="flex gap-3 fade-in">
                    <div
                      className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0"
                      style={{ background: `${nexus.color}22`, border: `1px solid ${nexus.color}40` }}
                    >
                      {nexus.emoji}
                    </div>
                    <div className="max-w-[80%] space-y-2">
                      <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-[14px]">
                        {m.text}
                      </div>
                      {m.routes && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.routes.map((r) => (
                            <span
                              key={r}
                              className="label-xs px-2 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary"
                            >
                              → {r.toUpperCase()}
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
                <div key={i} className="flex gap-3 fade-in">
                  <div
                    className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0"
                    style={{ background: `${color}22`, border: `1px solid ${color}40` }}
                  >
                    {a?.emoji ?? (m.agent === "Gmail" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />)}
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pt-2.5">
                      <span className="label-xs px-1.5 py-0.5 rounded border" style={{ borderColor: `${color}60`, color }}>
                        {isApp ? "APP" : "AGENT"} · {m.agent.toUpperCase()}
                      </span>
                    </div>
                    <div className="px-4 pb-3 pt-1.5 text-[14px]">{m.text}</div>
                    {!isApp && (
                      <div className="px-4 pb-3 flex gap-2">
                        <button className="text-[12px] px-2.5 py-1 rounded-md bg-primary text-primary-foreground">
                          Continue
                        </button>
                        <button className="text-[12px] px-2.5 py-1 rounded-md border border-border">Skip</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active tools */}
          <div className="px-4 pt-2 flex flex-wrap items-center gap-1.5 border-t border-border">
            <span className="label-xs text-muted-foreground">ACTIVE TOOLS</span>
            {[
              { name: "WhatsApp", icon: MessageSquare },
              { name: "Gmail", icon: Mail },
              { name: "Calendar", icon: Calendar },
            ].map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-1 label-xs px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              >
                <t.icon className="h-3 w-3" /> {t.name}
              </span>
            ))}
          </div>

          {/* Input */}
          <div className="p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
              <button className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground">
                <Paperclip className="h-4 w-4" />
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
                placeholder="Ask Nexus to do anything..."
                className="flex-1 resize-none bg-transparent outline-none text-[14px] py-1.5 px-1 max-h-32"
              />
              <button className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground">
                <Mic className="h-4 w-4" />
              </button>
              <button
                onClick={send}
                className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
};
