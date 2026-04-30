import { useEffect, useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { AgentCard } from "../AgentCard";
import {
  Activity, MessageSquare, Plug, Zap,
  Mail, Calendar, Send, Plus, ArrowUpRight, LogOut, Loader2,
  Copy, Share2, Gift, Users,
} from "lucide-react";
import { statsAPI, userAPI, type StatsResponse, type LimitStatusResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

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

  const [limitStatus, setLimitStatus] = useState<LimitStatusResponse | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [referralMsg, setReferralMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingStats(true);
    statsAPI
      .getStats()
      .then((data) => { if (!cancelled) setStats(data.stats); })
      .catch((err) => { if (!cancelled) setStatsError(err.message ?? "Failed to load stats"); })
      .finally(() => { if (!cancelled) setLoadingStats(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return;
    userAPI.getLimitStatus().then(setLimitStatus).catch(() => null);
  }, [user]);

  const copyCode = () => {
    const code = limitStatus?.referralCode ?? user?.referralCode ?? "";
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const applyReferral = async () => {
    const code = referralInput.trim().toUpperCase();
    if (!code || applyingReferral) return;
    setApplyingReferral(true);
    setReferralMsg(null);
    try {
      const res = await userAPI.applyReferral(code);
      setReferralMsg({ ok: true, text: res.message });
      setReferralInput("");
      // Refresh limit status to show updated bonusMessages
      userAPI.getLimitStatus().then(setLimitStatus).catch(() => null);
    } catch (err) {
      setReferralMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to apply code" });
    } finally {
      setApplyingReferral(false);
    }
  };

  const statCards = [
    {
      label: "ACTIVE AGENTS",
      value: loadingStats ? "—" : String(stats.activeAgents.length || agents.length),
      icon: Activity,
      sub: loadingStats ? "" : `${stats.activeAgents.length || agents.length} active`,
    },
    {
      label: "MESSAGES TODAY",
      value: loadingStats || !limitStatus ? "—" : String(limitStatus.messagesUsed),
      icon: MessageSquare,
      sub: loadingStats || !limitStatus ? "" : `${limitStatus.messagesLeft} remaining`,
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

  const referralCode = limitStatus?.referralCode ?? user?.referralCode ?? "";
  const bonusMessages = limitStatus?.bonusMessages ?? 0;
  const referralCount = limitStatus?.referralCount ?? 0;
  const totalLimit = limitStatus ? limitStatus.totalLimit : 50;
  const shareText = encodeURIComponent(
    `BotBetter AI try karo — India ka smartest AI agent platform! 🤖\nMera referral code use karo signup pe: ${referralCode}\nHum dono ko +20 free messages milenge! 🎁\nhttps://botbetter.in`
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Dashboard">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl">

        {/* User greeting + logout */}
        {user && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Hey, {user.name.split(" ")[0]} 👋</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {user.email}
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

        {/* ── Referral & Bonus section ─────────────────────────────────── */}
        {user && (
          <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-transparent p-5 space-y-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
                  <Gift className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-[15px]">Refer & Earn</div>
                  <div className="text-[12px] text-muted-foreground">
                    Dost ko refer karo — dono ko +20 messages milenge
                  </div>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-[12px]">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{referralCount}</span>
                  <span className="text-muted-foreground">referred</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[12px] text-emerald-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="font-medium">+{bonusMessages}</span>
                  <span>bonus msgs</span>
                </div>
              </div>
            </div>

            {/* Daily limit bar */}
            {limitStatus && (
              <div>
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                  <span>Daily messages: {limitStatus.messagesUsed} / {totalLimit}</span>
                  <span>{limitStatus.messagesLeft} left today</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (limitStatus.messagesUsed / totalLimit) * 100)}%`,
                      background:
                        limitStatus.messagesLeft / totalLimit > 0.5
                          ? "#10b981"
                          : limitStatus.messagesLeft / totalLimit > 0.25
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Your referral code */}
              <div className="space-y-2">
                <div className="label-xs text-muted-foreground">YOUR REFERRAL CODE</div>
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 px-4 py-3">
                  <span className="flex-1 font-mono text-xl font-bold tracking-widest text-emerald-400">
                    {referralCode || "—"}
                  </span>
                  <button
                    onClick={copyCode}
                    title="Copy code"
                    className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-secondary transition shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                {codeCopied && <p className="text-[11px] text-emerald-400">✓ Copied to clipboard!</p>}

                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#25D366] text-white text-[13px] font-medium hover:opacity-90 transition"
                >
                  <Share2 className="h-4 w-4" />
                  Share on WhatsApp
                </a>
              </div>

              {/* Apply a friend's code */}
              <div className="space-y-2">
                <div className="label-xs text-muted-foreground">APPLY FRIEND'S CODE</div>
                <div className="flex gap-2">
                  <input
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                    placeholder="Enter 6-char code"
                    maxLength={6}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[13px] font-mono uppercase outline-none focus:border-emerald-500/50 transition"
                  />
                  <button
                    onClick={applyReferral}
                    disabled={applyingReferral || referralInput.trim().length < 6}
                    className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-medium hover:bg-emerald-500 disabled:opacity-50 transition shrink-0"
                  >
                    {applyingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {referralMsg && (
                  <p className={`text-[12px] ${referralMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                    {referralMsg.ok ? "✓ " : "✗ "}{referralMsg.text}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Dost ka code apply karo — dono ko +20 free messages milenge permanently
                </p>
              </div>
            </div>
          </div>
        )}

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
              <AgentCard key={a.name} agent={a} active={i < 5} onClick={() => onNavigate("agent")} />
            ))}
          </div>
        </div>

        {/* Connected apps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg">Connected apps</h3>
            <button onClick={() => onNavigate("connections")} className="text-[12px] text-primary hover:underline">
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

        {/* Recent conversations */}
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
