import { useEffect, useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { AgentCard } from "../AgentCard";
import {
  Activity, MessageSquare, Plug, Zap,
  Mail, Calendar, Send, Plus, ArrowUpRight, LogOut, Loader2,
} from "lucide-react";
import { statsAPI, type StatsResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

// Fallback while loading
const PLACEHOLDER_STATS = {
  plan: "free",
  messagesUsed: 0,
  messagesLeft: 100,
  tokensUsed: 0,
  activeAgents: [] as string[],
  connectedApps: [] as string[],
  totalChats: 0,
};

const ALL_APPS = [
  { id: "whatsapp", name: "WhatsApp", icon: MessageSquare },
  { id: "gmail", name: "Gmail", icon: Mail },
  { id: "calendar", name: "Calendar", icon: Calendar },
  { id: "telegram", name: "Telegram", icon: Send },
];

export const Dashboard = ({
  active,
  onNavigate,
  onLogout,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  onLogout: () => void;
}) => {
  const { user } = useAuth();
  const nexus = agents[0];

  const [stats, setStats] = useState<StatsResponse["stats"]>(PLACEHOLDER_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingStats(true);
    statsAPI
      .getStats()
      .then((data) => {
        if (!cancelled) setStats(data.stats);
      })
      .catch((err) => {
        if (!cancelled) setStatsError(err.message ?? "Failed to load stats");
      })
      .finally(() => {
        if (!cancelled) setLoadingStats(false);
      });
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    {
      label: "ACTIVE AGENTS",
      value: loadingStats ? "—" : String(stats.activeAgents.length || agents.length),
      icon: Activity,
      sub: loadingStats ? "" : `${stats.plan.toUpperCase()} PLAN`,
    },
    {
      label: "MESSAGES USED",
      value: loadingStats ? "—" : String(stats.messagesUsed),
      icon: MessageSquare,
      sub: loadingStats ? "" : `${stats.messagesLeft} remaining`,
    },
    {
      label: "CONNECTED APPS",
      value: loadingStats ? "—" : String(stats.connectedApps.length),
      icon: Plug,
      sub: loadingStats ? "" : stats.connectedApps.length === 0 ? "None connected" : "Active",
    },
    {
      label: "TOKENS USED",
      value: loadingStats ? "—" : `${(stats.tokensUsed / 1000).toFixed(1)}K`,
      icon: Zap,
      sub: loadingStats ? "" : `${stats.totalChats} total chats`,
    },
  ];

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Dashboard">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl">

        {/* User greeting + logout */}
        {user && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Hey, {user.name.split(" ")[0]} 👋
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {user.email} · {user.plan.toUpperCase()} plan
              </p>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        )}

        {/* Stats error */}
        {statsError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
            ⚠ Could not load live stats: {statsError}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="label-xs text-muted-foreground">{s.label}</span>
                {loadingStats
                  ? <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                  : <s.icon className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              <div className="text-2xl font-medium mt-2">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Nexus status */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/40 grid place-items-center text-2xl glow-purple">
                {nexus.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{nexus.name} status</span>
                  <span className="inline-flex items-center gap-1 label-xs text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" /> ACTIVE
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {loadingStats
                    ? "Loading activity..."
                    : `${stats.messagesUsed} requests handled · ${stats.totalChats} total chats across all agents.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[12px]"
            >
              Open chat <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { l: "ROUTES/HR", v: "32" },
              { l: "AVG LATENCY", v: "240ms" },
              { l: "SUCCESS", v: "98.4%" },
            ].map((m) => (
              <div key={m.l} className="rounded-lg border border-border bg-card/60 p-3">
                <div className="label-xs text-muted-foreground">{m.l}</div>
                <div className="text-[15px] font-medium mt-1">{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My agents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-xs text-muted-foreground">MY AGENTS</div>
              <h3 className="text-lg">Your active workforce</h3>
            </div>
            <button
              onClick={() => onNavigate("create")}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-border hover:bg-secondary"
            >
              <Plus className="h-3.5 w-3.5" /> New agent
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((a, i) => (
              <AgentCard key={a.name} agent={a} active={i < 4} onClick={() => onNavigate("agent")} />
            ))}
          </div>
        </div>

        {/* Connected apps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg">Connected apps</h3>
            <button
              onClick={() => onNavigate("connections")}
              className="text-[12px] text-primary hover:underline"
            >
              Manage all →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_APPS.map((app) => {
              const connected = stats.connectedApps.includes(app.id);
              return (
                <div key={app.name} className="rounded-xl border border-border bg-card p-4">
                  <app.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-[13px] font-medium mt-3">{app.name}</div>
                  {connected ? (
                    <div className="mt-2 inline-flex items-center gap-1 label-xs text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> CONNECTED
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate("connections")}
                      className="mt-2 text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent conversations placeholder */}
        <div>
          <h3 className="text-lg mb-3">Recent conversations</h3>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {[
              { agent: "Nexus", text: "Routed tasks to Prepify and Gmail", time: "2m ago" },
              { agent: "Sellio", text: "Generated 12 product titles for Meesho", time: "18m ago" },
              { agent: "Finio", text: "Reviewed monthly budget — saved ₹2,400", time: "1h ago" },
              { agent: "Buddy", text: "Set 3 reminders for tomorrow", time: "3h ago" },
            ].map((c) => (
              <div
                key={c.text}
                className="p-4 flex items-center justify-between hover:bg-secondary/40 transition cursor-pointer"
                onClick={() => onNavigate("chat")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="label-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {c.agent.toUpperCase()}
                  </span>
                  <span className="text-[13px] truncate">{c.text}</span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashShell>
  );
};
