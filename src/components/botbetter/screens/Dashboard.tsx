import { useEffect, useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { AgentCard } from "../AgentCard";
import {
  Activity, MessageSquare, Plug, Zap,
  Mail, Calendar, Send, Plus, ArrowUpRight, LogOut, Loader2,
  Copy, Share2, Gift, Users, Settings2,
} from "lucide-react";
import { statsAPI, userAPI, type StatsResponse, type LimitStatusResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const LANGUAGES = [
  { code: "en-IN", label: "English" }, { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" }, { code: "bn-IN", label: "Bengali" },
  { code: "ta-IN", label: "Tamil" },   { code: "te-IN", label: "Telugu" },
  { code: "gu-IN", label: "Gujarati" },{ code: "pa-IN", label: "Punjabi" },
  { code: "kn-IN", label: "Kannada" }, { code: "ml-IN", label: "Malayalam" },
];

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
  const { user, updateUser } = useAuth();
  const nexus = agents[0];
  const [prefLang, setPrefLang] = useState(user?.language ?? "en-IN");
  const [prefVoice, setPrefVoice] = useState(user?.voice ?? "off");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

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

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await userAPI.updateOnboarding({ language: prefLang, voice: prefVoice });
      updateUser({ language: prefLang, voice: prefVoice });
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2000);
    } catch { /* ignore */ } finally {
      setSavingPrefs(false);
    }
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
      <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">

        {/* User greeting + logout + Beta badge */}
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hey, {user.name.split(" ")[0]} 👋</h2>
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white text-[11px] font-bold uppercase tracking-widest shadow-md">
                    Beta
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-[#FF3CAC] transition-colors text-slate-600"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}

        {statsError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600">
            ⚠ Could not load live stats: {statsError}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bento-card p-5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">{s.label}</span>
                {loadingStats
                  ? <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                  : <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                      <s.icon className="h-4 w-4 text-purple-600" />
                    </div>}
              </div>
              <div className="text-3xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-2">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Referral & Bonus section ─────────────────────────────────── */}
        {user && (
          <div className="bento-card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 grid place-items-center shadow-sm">
                  <Gift className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-900">Refer & Earn</div>
                  <div className="text-sm font-medium text-slate-600">
                    Dost ko refer karo — dono ko +20 messages milenge
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-sm">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-slate-900">{referralCount}</span>
                  <span className="font-medium text-slate-500">referred</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 shadow-sm">
                  <Zap className="h-4 w-4" />
                  <span className="font-bold">+{bonusMessages}</span>
                  <span className="font-medium">bonus msgs</span>
                </div>
              </div>
            </div>

            {limitStatus && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span>Daily messages: {limitStatus.messagesUsed} / {totalLimit}</span>
                  <span className="text-emerald-600">{limitStatus.messagesLeft} left today</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
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

            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-emerald-100">
              <div className="space-y-3">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">YOUR REFERRAL CODE</div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-white px-4 py-3 shadow-sm">
                  <span className="flex-1 font-mono text-2xl font-bold tracking-widest text-emerald-600 text-center">
                    {referralCode || "—"}
                  </span>
                  <button
                    onClick={copyCode}
                    title="Copy code"
                    className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition-all shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {codeCopied && <p className="text-xs font-bold text-emerald-600 text-center">✓ Copied to clipboard!</p>}

                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#25D366] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  Share on WhatsApp
                </a>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">APPLY FRIEND'S CODE</div>
                <div className="flex gap-2">
                  <input
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                    placeholder="ENTER 6-CHAR CODE"
                    maxLength={6}
                    className="flex-1 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-mono font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-400 transition-colors shadow-sm placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-normal"
                  />
                  <button
                    onClick={applyReferral}
                    disabled={applyingReferral || referralInput.trim().length < 6}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold shadow-md hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all shrink-0"
                  >
                    {applyingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {referralMsg && (
                  <p className={`text-xs font-bold ${referralMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                    {referralMsg.ok ? "✓ " : "✗ "}{referralMsg.text}
                  </p>
                )}
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Dost ka code apply karo — dono ko +20 free messages milenge permanently.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nexus status */}
        <div className="bento-card border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 sm:p-8 hover:-translate-y-1">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] grid place-items-center text-3xl shadow-lg shadow-purple-500/30">
                {nexus.emoji}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-900">{nexus.name} Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-widest uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">
                  {loadingStats
                    ? "Loading activity..."
                    : `${stats.messagesUsed} requests handled · ${stats.totalChats} total chats across all agents.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Open Chat <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-purple-100">
            {[
              { l: "ROUTES/HR", v: "32" },
              { l: "AVG LATENCY", v: "240ms" },
              { l: "SUCCESS", v: "98.4%" },
            ].map((m) => (
              <div key={m.l} className="rounded-xl bg-white/60 border border-purple-100 p-4">
                <div className="text-xs font-bold tracking-wider text-purple-400 mb-1">{m.l}</div>
                <div className="text-lg font-bold text-slate-900">{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My agents */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">MY AGENTS</div>
              <h3 className="text-2xl font-bold text-slate-900">Your Active Workforce</h3>
            </div>
            <button
              onClick={() => onNavigate("create")}
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4" /> New Agent
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a, i) => (
              <AgentCard key={a.name} agent={a} active={i < 5} onClick={() => onNavigate("agent")} />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connected apps */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Connected Apps</h3>
              <button onClick={() => onNavigate("connections")} className="text-sm font-bold text-[#6C00FF] hover:underline">
                Manage all →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {ALL_APPS.map((app) => {
                const connected = stats.connectedApps.includes(app.id);
                return (
                  <div key={app.name} className="bento-card p-5 text-center flex flex-col items-center justify-center hover:-translate-y-1">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 ${connected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <app.icon className={`h-6 w-6 ${connected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-sm font-bold text-slate-900">{app.name}</div>
                    {connected ? (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                      </div>
                    ) : (
                      <button
                        onClick={() => onNavigate("connections")}
                        className="mt-3 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
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
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Conversations</h3>
            <div className="bento-card divide-y divide-slate-100">
              {[
                { agent: "Nexus", text: "Routed tasks to Prepify and Gmail", time: "2m ago", color: "bg-purple-100 text-purple-700" },
                { agent: "Sellio", text: "Generated 12 product titles for Meesho", time: "18m ago", color: "bg-pink-100 text-pink-700" },
                { agent: "Finio", text: "Reviewed monthly budget — saved ₹2,400", time: "1h ago", color: "bg-emerald-100 text-emerald-700" },
                { agent: "Buddy", text: "Set 3 reminders for tomorrow", time: "3h ago", color: "bg-blue-100 text-blue-700" },
              ].map((c) => (
                <div
                  key={c.text}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => onNavigate("chat")}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest shrink-0 ${c.color}`}>
                      {c.agent}
                    </span>
                    <span className="text-sm font-medium text-slate-700 truncate">{c.text}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 shrink-0 ml-4">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Preferences ──────────────────────────────────────────── */}
        <div className="bento-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-50 grid place-items-center">
              <Settings2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Language & Voice</div>
              <div className="text-xs text-slate-500">Change how agents communicate with you</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Response Language</label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-900 outline-none focus:border-purple-400 transition"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Voice</label>
              <select
                value={prefVoice}
                onChange={(e) => setPrefVoice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-900 outline-none focus:border-purple-400 transition"
              >
                <option value="female">👩 Female</option>
                <option value="male">👨 Male</option>
                <option value="off">🔇 No voice</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={savePrefs}
              disabled={savingPrefs}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition flex items-center gap-2"
              style={{ background: "#7C6BFF" }}
            >
              {savingPrefs && <Loader2 className="h-4 w-4 animate-spin" />}
              Save preferences
            </button>
            {prefSaved && <span className="text-sm font-semibold text-emerald-600">✓ Saved!</span>}
          </div>
        </div>

      </div>
    </DashShell>
  );
};
