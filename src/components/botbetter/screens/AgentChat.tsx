import { useState, useEffect, useRef } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import {
  Send, ArrowLeft, Plus, Mic, Paperclip, Settings2,
  Loader2, AlertCircle, Copy, Share2,
} from "lucide-react";
import { chatAPI, userAPI, ApiError, type LimitStatusResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useVoiceMode } from "@/context/VoiceModeContext";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { cn } from "@/lib/utils";

type Msg = { from: "user" | "bot"; text: string };

// Welcome messages shown to new users before any real history loads
const agentWelcome: Record<string, string> = {
  Buddy:   "Hey! Main Buddy hoon — aapka personal AI assistant. Tasks, notes, reminders, general help — kuch bhi batao! 😊",
  Prepify: "Namaste! Main Prepify hoon 🎤 — aapka AI interview coach. Mock interviews, resume review, DSA, HR — sab kuch. Batao kaunsi company ke liye prep karna hai!",
  Sellio:  "Jai ho! 🛍️ Main Sellio hoon — aapka e-commerce AI. Meesho, Amazon, Flipkart — listings, pricing, customer replies — sab handle karunga. Batao kya chahiye!",
  Creato:  "Hey creator! 🎬 Main Creato hoon — aapka AI content strategist. Reels, scripts, captions, content calendars — sab kuch. Chalo viral ho jaate hain! 🚀",
  Finio:   "Namaste! 💰 Main Finio hoon — aapka personal finance AI. SIP, EMI, tax saving, budget planning — sab simple Hinglish mein. Kya poochna hai?",
  Cracky:  "Jai ho! 📚 Main Cracky hoon — aapka exam cracker AI. NEET, JEE, UPSC, CA — personalized study plan, MCQ practice, weak topic tracking. Konsa exam prepare kar rahe ho?",
  FlexAI:  "Hey! Main FlexAI hoon 💪 — aapka personal fitness and diet coach. Workout plans, Indian diet charts, weight loss/gain — sab kuch. Batao kya goal hai aapka!",
};

const chatHistory: Record<string, string[]> = {
  Buddy:   ["Aaj ke tasks", "Meeting reminder", "Note save karo"],
  Prepify: ["TCS mock interview", "Resume review — SDE", "Mock HR round"],
  Sellio:  ["Saree listings optimize", "Competitor price check", "Customer reply drafts"],
  Creato:  ["Reel ideas — fitness", "YouTube script draft", "Instagram caption pack"],
  Finio:   ["SIP planning ₹5k/month", "Tax saving ELSS options", "Monthly budget review"],
  Cracky:  ["NEET Physics prep", "JEE Maths integration", "UPSC GS Paper 2"],
  FlexAI:  ["10kg weight loss plan", "Vegetarian diet chart", "Home workout routine"],
};

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function LimitModal({
  resetTime,
  referralCode,
  onClose,
}: {
  resetTime: Date;
  referralCode: string;
  onClose: () => void;
}) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000))
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [resetTime]);

  const copy = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareText = encodeURIComponent(
    `BotBetter AI try karo — India ka smartest AI agent platform! 🤖\nMera referral code use karo signup pe: ${referralCode}\nHum dono ko +20 free messages milenge! 🎁\nhttps://botbetter.in`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 space-y-6 shadow-2xl animate-fade-in border-2 border-slate-100">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🌙</div>
          <h2 className="text-2xl font-bold text-slate-900">Aaj ki limit ho gayi!</h2>
          <p className="text-sm font-medium text-slate-500">
            Kal reset hogi — 24 ghante baad
          </p>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 text-center shadow-inner">
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">RESET IN</div>
          <div className="text-4xl font-mono font-bold tracking-widest text-[#6C00FF]">
            {formatCountdown(seconds)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm font-medium text-slate-600">
            Dost ko refer karo — dono ko <span className="text-emerald-500 font-bold">+20 messages</span> milenge! 🎁
          </div>

          <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-3 shadow-sm">
            <span className="flex-1 text-center font-mono text-xl font-bold tracking-widest text-[#6C00FF]">
              {referralCode}
            </span>
            <button
              onClick={copy}
              className="shrink-0 h-10 w-10 grid place-items-center rounded-xl bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {copied && (
            <p className="text-center text-xs font-bold text-emerald-600">✓ Code copied!</p>
          )}

          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#25D366] text-white text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors pt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export const AgentChat = ({
  active,
  onNavigate,
  agentIdx,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  agentIdx: number;
}) => {
  const { user } = useAuth();
  const { voiceMode } = useVoiceMode();
  const a = agents[agentIdx];
  const agentName = a.name.toLowerCase();

  const welcomeMsg: Msg = {
    from: "bot",
    text: agentWelcome[a.name] ?? `Hi! I'm ${a.name} — ${a.desc}. How can I help you today?`,
  };

  const [msgs, setMsgs] = useState<Msg[]>([welcomeMsg]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [limitStatus, setLimitStatus] = useState<LimitStatusResponse | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitResetTime, setLimitResetTime] = useState<Date | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const userLanguage = user?.language || "en-IN";

  const voice = useVoiceChat({
    language: userLanguage,
    onResult: (data) => {
      setSendError("");
      setMsgs((m) => [
        ...m,
        { from: "user", text: data.transcript },
        { from: "bot", text: data.reply },
      ]);

      if (limitStatus) {
        setLimitStatus((prev) =>
          prev
            ? { ...prev, messagesUsed: prev.messagesUsed + 1, messagesLeft: Math.max(0, prev.messagesLeft - 1) }
            : prev
        );
      }
    },
    onError: (message, err) => {
      if (err instanceof ApiError && err.data.limitReached) {
        const resetTime = new Date(err.data.resetTime as string);
        setLimitResetTime(resetTime);
        setShowLimitModal(true);
        return;
      }
      setSendError(message.toLowerCase().includes("limit") ? "Message limit reached. Please upgrade your plan." : message);
    },
  });

  const busy = sending || voice.processing;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!user || historyLoaded) return;
    chatAPI
      .getHistory(agentName)
      .then((data) => {
        if (data.history.length > 0) {
          setMsgs(data.history.map((m) => ({ from: m.role === "user" ? "user" : "bot", text: m.content })));
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [user, agentName, historyLoaded]);

  useEffect(() => {
    if (!user) return;
    userAPI.getLimitStatus().then(setLimitStatus).catch(() => null);
  }, [user]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setSendError("");
    setMsgs((m) => [...m, { from: "user", text }]);
    setSending(true);

    if (!user) {
      setMsgs((m) => [
        ...m,
        { from: "bot", text: `Please log in to chat with ${a.name}. Tap the login button below! 👇` },
      ]);
      setSending(false);
      return;
    }

    try {
      const data = await chatAPI.sendMessage(agentName, text);
      setMsgs((m) => [...m, { from: "bot", text: data.reply }]);

      if (limitStatus) {
        setLimitStatus((prev) =>
          prev
            ? { ...prev, messagesUsed: prev.messagesUsed + 1, messagesLeft: Math.max(0, prev.messagesLeft - 1) }
            : prev
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.data.limitReached) {
        const resetTime = new Date(err.data.resetTime as string);
        setLimitResetTime(resetTime);
        setShowLimitModal(true);
        setMsgs((m) => m.slice(0, -1));
        setInput(text);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to get response";
        setSendError(msg.toLowerCase().includes("limit") ? "Message limit reached. Please upgrade your plan." : msg);
        setMsgs((m) => [...m, { from: "bot", text: `Sorry, something went wrong. Please try again!` }]);
      }
    } finally {
      setSending(false);
    }
  };

  const history = chatHistory[a.name] ?? [];

  const pctUsed = limitStatus && limitStatus.totalLimit > 0
    ? limitStatus.messagesUsed / limitStatus.totalLimit
    : 0;
  const pctLeft = 1 - pctUsed;
  const barColor = pctLeft > 0.5 ? "#10b981" : pctLeft > 0.25 ? "#f59e0b" : "#ef4444";
  const textColor = pctLeft > 0.5 ? "text-emerald-600" : pctLeft > 0.25 ? "text-amber-600" : "text-red-600";

  return (
    <DashShell active={active} onNavigate={onNavigate} title={`${a.name} Chat`}>
      {showLimitModal && limitResetTime && (
        <LimitModal
          resetTime={limitResetTime}
          referralCode={limitStatus?.referralCode ?? user?.referralCode ?? "—"}
          onClose={() => setShowLimitModal(false)}
        />
      )}

      <div className="flex h-[calc(100vh-4rem)] min-h-0 bg-slate-50">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r-2 border-slate-100 bg-white z-10 shadow-sm">
          <div className="p-4 border-b-2 border-slate-100 flex items-center gap-3">
            <button
              onClick={() => onNavigate("agent")}
              className="h-10 w-10 grid place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              style={{ background: `${a.color}15`, border: `2px solid ${a.color}30`, color: a.color }}
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-2">RECENT</div>
            {history.map((t, i) => (
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

          <div className="p-4 border-t-2 border-slate-100">
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: `${a.color}10`, border: `2px solid ${a.color}25` }}
            >
              <div className="text-2xl">{a.emoji}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900">{a.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">{a.role}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Header */}
          <div className="h-20 border-b-2 border-slate-100 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate("agent")}
                className="h-10 w-10 grid place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div
                className="h-12 w-12 rounded-xl grid place-items-center text-xl shadow-sm"
                style={{ background: `${a.color}15`, border: `2px solid ${a.color}30` }}
              >
                {a.emoji}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 leading-tight">
                  {a.name}
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: a.color }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: a.color }} />
                  {a.role}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate("connections")}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Settings2 className="h-4 w-4" /> Settings
            </button>
          </div>

          {/* Daily limit bar */}
          {user && limitStatus && (
            <div className="px-6 py-3 border-b-2 border-slate-100 bg-white shrink-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>
                  {limitStatus.messagesLeft} Messages Remaining Today
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {limitStatus.messagesUsed} / {limitStatus.totalLimit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pctUsed * 100)}%`, background: barColor }}
                />
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-auto scrollbar-thin p-4 sm:p-8 space-y-6">
            {msgs.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="flex justify-end animate-fade-in">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-900 text-white px-6 py-4 text-sm font-medium shadow-md">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-4 animate-fade-in">
                  <div
                    className="h-10 w-10 rounded-xl grid place-items-center text-base shrink-0 mt-1 shadow-sm"
                    style={{ background: `${a.color}15`, border: `2px solid ${a.color}30` }}
                  >
                    {a.emoji}
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border-2 border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-700 whitespace-pre-line shadow-sm leading-relaxed">
                    {m.text}
                  </div>
                </div>
              )
            )}

            {busy && (
              <div className="flex gap-4 animate-fade-in">
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center text-base shrink-0 shadow-sm"
                  style={{ background: `${a.color}15`, border: `2px solid ${a.color}30` }}
                >
                  {a.emoji}
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
                placeholder={!user ? "LOG IN TO CHAT WITH A LIVE AGENT..." : `ASK ${a.name.toUpperCase()} ANYTHING...`}
                className="flex-1 resize-none bg-transparent outline-none text-sm font-bold tracking-widest text-slate-900 py-3.5 px-2 max-h-32 placeholder:text-slate-300 placeholder:font-bold"
                disabled={busy || voiceMode}
              />
              <button
                onClick={() => {
                  if (!user) {
                    setSendError("Please log in to use voice chat.");
                    return;
                  }
                  voice.toggleRecording();
                }}
                disabled={voice.processing || sending}
                className={cn(
                  "h-10 w-10 grid place-items-center rounded-xl transition-colors mb-1",
                  voice.recording
                    ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse"
                    : voiceMode
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50",
                  (voice.processing || sending) && "opacity-60"
                )}
                aria-label={voice.recording ? "Stop recording" : "Start voice chat"}
                title={voice.recording ? "Stop recording" : "Start voice chat"}
              >
                {voice.processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={send}
                disabled={busy || voiceMode || !input.trim()}
                className="h-12 w-12 grid place-items-center rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 mb-0.5 mr-0.5"
                style={{ background: a.color }}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            {!user && (
              <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                <button onClick={() => onNavigate("landing")} className="text-[#6C00FF] hover:underline">
                  Log in
                </button>
                {" "}to unlock real AI responses from {a.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </DashShell>
  );
};
