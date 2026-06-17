import { useEffect, useState, useRef } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import {
  MessageSquare, Plug, Zap,
  Mail, Calendar, Send, ArrowUpRight, LogOut, Loader2,
  Copy, Share2, Gift, Users, Settings2, Volume2, VolumeX,
  Mic, MicOff, Bot, Sparkles,
} from "lucide-react";
import { statsAPI, userAPI, type StatsResponse, type LimitStatusResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcher } from "../ThemeProvider";

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

  const initVoice = user?.voice ?? "off";
  const [personality, setPersonality] = useState<"maya" | "kabir">(
    initVoice === "male" ? "kabir" : "maya"
  );
  const [voiceOn, setVoiceOn] = useState(initVoice !== "off");
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

  // Custom prompts
  const [customPrompt, setCustomPrompt] = useState(
    user?.personality === "kabir"
      ? "You are Kabir — professional, direct, and results-focused. Help me get things done efficiently."
      : "You are Maya — warm, friendly, and creative. Help me with everything in a personalized way."
  );
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);

  // Voice project creation
  const [voiceProjectMode, setVoiceProjectMode] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCreated, setProjectCreated] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    const voiceVal = voiceOn ? (personality === "kabir" ? "male" : "female") : "off";
    try {
      await userAPI.updateOnboarding({ language: prefLang, voice: voiceVal });
      updateUser({ language: prefLang, voice: voiceVal });
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

  const saveCustomPrompt = async () => {
    setSavingPrompt(true);
    try {
      await userAPI.updateProfile({ customPrompt } as Parameters<typeof userAPI.updateProfile>[0]);
      setPromptSaved(true);
      setTimeout(() => setPromptSaved(false), 2000);
    } catch { /* ignore */ } finally { setSavingPrompt(false); }
  };

  const startVoiceProject = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = user?.language ?? "en-IN";
    rec.onstart = () => setVoiceListening(true);
    rec.onend = () => setVoiceListening(false);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      setVoiceTranscript(transcript);
      if (e.results[0].isFinal) {
        setProjectName(transcript.trim());
        setTimeout(() => setProjectCreated(true), 400);
      }
    };
    recognitionRef.current = rec;
    rec.start();
    setVoiceProjectMode(true);
    setVoiceTranscript("");
    setProjectCreated(false);
  };

  const statCards = [
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
    `BotBetter AI try karo — India ka smartest AI platform! 🤖\nMera referral code use karo signup pe: ${referralCode}\nHum dono ko +20 free messages milenge! 🎁\nhttps://botbetter.in`
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Dashboard">
      <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">

        {/* User greeting + logout */}
        {user && (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Hey, {user.name.split(" ")[0]} 👋</h2>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white text-[11px] font-bold uppercase tracking-widest shadow-md">
                  Beta
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-border bg-card shadow-sm hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}

        {statsError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400">
            ⚠ Could not load live stats: {statsError}
          </div>
        )}

        {/* Stat cards — 3 only */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bento-card p-5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{s.label}</span>
                {loadingStats
                  ? <Loader2 className="h-4 w-4 text-primary/60 animate-spin" />
                  : <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>}
              </div>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs font-semibold text-muted-foreground mt-2">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Referral & Bonus */}
        {user && (
          <div className="bento-card border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 grid place-items-center shadow-sm">
                  <Gift className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">Refer & Earn</div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Dost ko refer karo — dono ko +20 messages milenge
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-foreground">{referralCount}</span>
                  <span className="font-medium text-muted-foreground">referred</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-400 shadow-sm">
                  <Zap className="h-4 w-4" />
                  <span className="font-bold">+{bonusMessages}</span>
                  <span className="font-medium">bonus msgs</span>
                </div>
              </div>
            </div>

            {limitStatus && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                  <span>Daily messages: {limitStatus.messagesUsed} / {totalLimit}</span>
                  <span className="text-emerald-400">{limitStatus.messagesLeft} left today</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (limitStatus.messagesUsed / totalLimit) * 100)}%`,
                      background:
                        limitStatus.messagesLeft / totalLimit > 0.5 ? "#10b981"
                        : limitStatus.messagesLeft / totalLimit > 0.25 ? "#f59e0b"
                        : "#ef4444",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-emerald-500/10">
              <div className="space-y-3">
                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">YOUR REFERRAL CODE</div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-emerald-500/20 bg-card px-4 py-3 shadow-sm">
                  <span className="flex-1 font-mono text-2xl font-bold tracking-widest text-emerald-400 text-center">
                    {referralCode || "—"}
                  </span>
                  <button
                    onClick={copyCode}
                    title="Copy code"
                    className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 transition-all shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {codeCopied && <p className="text-xs font-bold text-emerald-400 text-center">✓ Copied!</p>}
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
                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">APPLY FRIEND'S CODE</div>
                <div className="flex gap-2">
                  <input
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                    placeholder="ENTER 6-CHAR CODE"
                    maxLength={6}
                    className="flex-1 rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm font-mono font-bold tracking-widest text-foreground outline-none focus:border-emerald-400 transition-colors shadow-sm placeholder:text-muted-foreground/50"
                  />
                  <button
                    onClick={applyReferral}
                    disabled={applyingReferral || referralInput.trim().length < 6}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold shadow-md hover:bg-emerald-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all shrink-0"
                  >
                    {applyingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {referralMsg && (
                  <p className={`text-xs font-bold ${referralMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                    {referralMsg.ok ? "✓ " : "✗ "}{referralMsg.text}
                  </p>
                )}
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Dost ka code apply karo — dono ko +20 free messages milenge permanently.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nexus status */}
        <div className="bento-card border-primary/20 bg-primary/5 p-6 sm:p-8 hover:-translate-y-1">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] grid place-items-center text-3xl shadow-lg shadow-purple-500/30">
                {nexus.emoji}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-foreground">{nexus.name} Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  {loadingStats
                    ? "Loading activity..."
                    : `${stats.messagesUsed} requests handled · ${stats.totalChats} total chats`}
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
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary/10">
            {[
              { l: "ROUTES/HR", v: "32" },
              { l: "AVG LATENCY", v: "240ms" },
              { l: "SUCCESS", v: "98.4%" },
            ].map((m) => (
              <div key={m.l} className="rounded-xl bg-card/60 border border-border p-4">
                <div className="text-xs font-bold tracking-wider text-primary/70 mb-1">{m.l}</div>
                <div className="text-lg font-bold text-foreground">{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connected apps */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Connected Apps</h3>
              <button onClick={() => onNavigate("connections")} className="text-sm font-bold text-primary hover:underline">
                Manage all →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {ALL_APPS.map((app) => {
                const connected = stats.connectedApps.includes(app.id);
                return (
                  <div key={app.name} className="bento-card p-5 text-center flex flex-col items-center justify-center hover:-translate-y-1">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 ${connected ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                      <app.icon className={`h-6 w-6 ${connected ? "text-emerald-400" : "text-primary/70"}`} />
                    </div>
                    <div className="text-sm font-bold text-foreground">{app.name}</div>
                    {connected ? (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                      </div>
                    ) : (
                      <button
                        onClick={() => onNavigate("connections")}
                        className="mt-3 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary/10 text-primary/80 hover:bg-primary/20 transition-colors"
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
            <h3 className="text-xl font-bold text-foreground mb-6">Recent Conversations</h3>
            <div className="bento-card divide-y divide-border/50">
              {[
                { text: "Planned weekly schedule and tasks", time: "2m ago" },
                { text: "Drafted reply to client email", time: "18m ago" },
                { text: "Reviewed monthly budget breakdown", time: "1h ago" },
                { text: "Set 3 reminders for tomorrow", time: "3h ago" },
              ].map((c) => (
                <div
                  key={c.text}
                  className="p-5 flex items-center justify-between hover:bg-primary/5 transition cursor-pointer"
                  onClick={() => onNavigate("chat")}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest shrink-0 bg-primary/10 text-primary">
                      NEXUS
                    </span>
                    <span className="text-sm font-medium text-foreground/80 truncate">{c.text}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 ml-4">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Prompts */}
        {user && (
          <div className="bento-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-foreground">Custom Behavior</div>
                <div className="text-xs text-muted-foreground">Tell Nexus exactly how to behave for you</div>
              </div>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              placeholder="Example: Always respond in Hindi. Keep answers concise. Focus on actionable steps..."
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary transition resize-none placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={saveCustomPrompt}
                disabled={savingPrompt}
                className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition flex items-center gap-2 text-white"
                style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)" }}
              >
                {savingPrompt && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Behavior
              </button>
              {promptSaved && <span className="text-sm font-semibold text-emerald-400">✓ Saved!</span>}
              <button
                onClick={() => setCustomPrompt("")}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive transition"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Voice Project Creation */}
        {user && (
          <div className="bento-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Voice Project Creation</div>
                  <div className="text-xs text-muted-foreground">Speak to create a new project — Jarvis style</div>
                </div>
              </div>
              <button
                onClick={startVoiceProject}
                disabled={voiceListening}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition hover:-translate-y-0.5"
                style={{ background:"linear-gradient(135deg,#00D4FF,#0088AA)" }}
              >
                {voiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {voiceListening ? "Listening…" : "Start Voice"}
              </button>
            </div>

            {voiceProjectMode && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-8 w-8 rounded-full grid place-items-center"
                    style={{
                      background: voiceListening
                        ? "rgba(255,59,48,0.15)"
                        : projectCreated
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(0,212,255,0.1)",
                      border: voiceListening
                        ? "1.5px solid rgba(255,59,48,0.5)"
                        : projectCreated
                        ? "1.5px solid rgba(16,185,129,0.4)"
                        : "1.5px solid rgba(0,212,255,0.3)",
                    }}
                  >
                    {voiceListening ? (
                      <div className="h-3 w-3 rounded-full bg-red-400 animate-ping" />
                    ) : projectCreated ? (
                      <span className="text-emerald-400 text-xs font-bold">✓</span>
                    ) : (
                      <Mic className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: voiceListening ? "#FF3B30" : projectCreated ? "#10B981" : "var(--color-primary)" }}>
                    {voiceListening ? "Listening — speak your project name…" : projectCreated ? "Project created!" : "Ready"}
                  </span>
                </div>
                {voiceTranscript && (
                  <p className="text-lg font-bold text-foreground italic">"{voiceTranscript}"</p>
                )}
                {projectCreated && projectName && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">New Project Created</div>
                    <div className="text-base font-bold text-foreground">{projectName}</div>
                    <div className="text-xs text-muted-foreground mt-1">Nexus will remember context for this project</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preferences */}
        <div className="bento-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-foreground">Preferences</div>
              <div className="text-xs text-muted-foreground">Customize your Nexus experience</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Response Language</label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-[14px] font-medium text-foreground outline-none focus:border-primary transition"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Nexus Personality */}
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Nexus Personality</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "maya" as const, name: "Maya", desc: "Warm & expressive", gradient: "from-pink-500 to-purple-600", emoji: "🎙️" },
                  { key: "kabir" as const, name: "Kabir", desc: "Deep & authoritative", gradient: "from-blue-500 to-cyan-600", emoji: "🎙️" },
                ].map((p) => {
                  const isSelected = personality === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => { setPersonality(p.key); if (!voiceOn) setVoiceOn(true); }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,212,255,0.08)]"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-xl shadow-md shrink-0`}>
                        {p.emoji}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice on/off toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                {voiceOn
                  ? <Volume2 className="h-5 w-5 text-primary" />
                  : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <div className="font-semibold text-sm text-foreground">Voice Responses</div>
                  <div className="text-xs text-muted-foreground">
                    {voiceOn ? `${personality === "maya" ? "Maya" : "Kabir"} will speak replies` : "Text only mode"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setVoiceOn(!voiceOn)}
                className="relative w-12 h-6 rounded-full transition-all duration-200"
                style={{ background: voiceOn ? "var(--color-primary, #00D4FF)" : "hsl(var(--muted))" }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200"
                  style={{ left: voiceOn ? "1.5rem" : "0.125rem" }}
                />
              </button>
            </div>

            {/* Theme selector */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div>
                <div className="font-semibold text-sm text-foreground">Theme</div>
                <div className="text-xs text-muted-foreground">Nexus · Void · Gen Z</div>
              </div>
              <ThemeSwitcher />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={savePrefs}
              disabled={savingPrefs}
              className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition flex items-center gap-2 text-white"
              style={{ background: "linear-gradient(135deg, #6C00FF, #FF3CAC)" }}
            >
              {savingPrefs && <Loader2 className="h-4 w-4 animate-spin" />}
              Save preferences
            </button>
            {prefSaved && <span className="text-sm font-semibold text-emerald-400">✓ Saved!</span>}
          </div>
        </div>

      </div>
    </DashShell>
  );
};
