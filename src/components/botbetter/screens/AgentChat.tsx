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

type Msg = { from: "user" | "bot"; text: string };

// ── Seed conversations ────────────────────────────────────────────────────────

const agentSeeds: Record<string, Msg[]> = {
  Buddy: [
    { from: "bot", text: "Hey! Main Buddy hoon — aapka personal AI assistant. Batao kya help chahiye aaj? 😊" },
    { from: "user", text: "Buddy, aaj mujhe kya karna hai? Aur kal ki meeting ka reminder set karo" },
    { from: "bot", text: "Bilkul! Aaj ke 3 pending tasks hain:\n\n✅ Invoice #204 approve karna — Rohan ka\n📞 Client call 3:00 PM — Priya @ Flipkart\n🏋️ Gym 6:30 PM — Leg day\n\nAur kal 10 AM meeting hai Rahul ke saath — Zomato office, BKC.\n\nReminder set karoon? 9:45 AM pe alert bhejunga (15 min pehle)." },
    { from: "user", text: "Haan reminder set karo. Aur Priya ko confirm email bhi bhejo" },
    { from: "bot", text: "Done! ✅\n\n📌 Reminder set: Kal 9:45 AM — \"Meeting with Rahul @ Zomato, 10 AM\"\n\n📧 Email drafted to priya@flipkart.com:\nSubject: Confirming our call today at 3 PM\n\"Hi Priya, just confirming our call for today at 3:00 PM IST. Looking forward to it!\"\n\nBhejoon? Ya kuch edit karna hai?" },
  ],
  Prepify: [
    { from: "bot", text: "Namaste! Main Prepify hoon 🎤 — aapka AI interview coach. Interview, resume, ya career guidance — kuch bhi pooch sakte ho!" },
    { from: "user", text: "Prepify, mujhe Razorpay mein PM role ke liye interview hai next week" },
    { from: "bot", text: "Congratulations on the interview! 🎯 Razorpay ke liye main bilkul ready kar deta hoon.\n\nPehle quick background check — kitne saal ka experience hai aapka aur kaunse domain mein?" },
    { from: "user", text: "3 saal, fintech startup mein tha. Payments product manage kiya" },
    { from: "bot", text: "Perfect! Yahi toh Razorpay dhundh raha hai.\n\n🎙️ Pehla question (Behavioral):\n\n\"Tell me about a time you prioritized user needs over engineering constraints. What tradeoff did you make?\"\n\nSTAR format mein jawab dein — main real-time feedback dunga 💬" },
  ],
  Sellio: [
    { from: "bot", text: "Jai ho! 🛍️ Main Sellio hoon — aapka e-commerce AI agent. Meesho, Amazon, Flipkart — listings, pricing, customer replies — sab handle karunga. Batao kya chahiye!" },
    { from: "user", text: "Iska title improve karo — 'cotton printed saree'" },
    { from: "bot", text: "3 SEO-optimized titles ready! 🛒\n\n1. Premium Cotton Printed Saree | Festive & Daily Wear | Free Size\n2. Ethnic Block Print Cotton Saree | Meesho Bestseller | 5-Star Rated\n3. Handcrafted Cotton Saree for Women | Casual & Party Wear 2024\n\n💡 Title #2 sabse better hai — is category mein search volume peak pe hai." },
    { from: "user", text: "Price kitna rakhu? ₹380 mein padti hai mujhe" },
    { from: "bot", text: "Category data dekha 📊 — competitors ₹699–₹849 mein bech rahe hain.\n\n💡 Recommended: ₹749\n• Net profit after fees: ~₹249\n• ₹750 se neeche = algorithm boost\n• 60%+ conversion rate is range mein\n\nFull competitor analysis karoon?" },
  ],
  Creato: [
    { from: "bot", text: "Hey creator! 🎬 Main Creato hoon — aapka AI content strategist. Reels, scripts, captions, content calendars — sab kuch. Chalo viral ho jaate hain! 🚀" },
    { from: "user", text: "Mujhe Diwali ke liye fashion reel ideas chahiye" },
    { from: "bot", text: "Diwali reels ke liye 5 banger ideas ✨🪔\n\n1. 'Ek dupatta, 5 looks' — transition reel, high shares\n2. 'Budget ₹500 vs Luxury ₹5000 Diwali outfit' — comparison format\n3. 'Thrift to festive queen transformation' — glow-up style\n4. 'Saree draping in 60 seconds' — tutorial format\n5. 'Diwali week outfit diary' — vlog-style daily series\n\nKaunse ka script aur shot list banoon?" },
    { from: "user", text: "Pehla wala — script bana do" },
    { from: "bot", text: "Script ready! 🎥\n\n🔴 Hook (0–3s): \"Ek dupatta... paanch looks. Let's go! ✨\"\n\n📸 Shots (3–22s):\n• Cape style — slow 360° spin\n• Belt over kurta — beat drop transition\n• Saree-style drape — dramatic reveal\n• Scarf wrap — mirror selfie POV\n• Classic shoulder — final twirl\n\n🔚 CTA: \"Save karo — Diwali aa rahi hai! 🪔\"\n\n🎵 Trending audio suggest karoon?" },
  ],
  Finio: [
    { from: "bot", text: "Namaste! 💰 Main Finio hoon — aapka personal finance AI. SIP, tax saving, budget planning — sab kuch simple Hinglish mein samjhaunga. Kya poochna hai?" },
    { from: "user", text: "Finio, mujhe SIP shuru karni hai — ₹5000/month" },
    { from: "bot", text: "Bahut achha decision! 📈 ₹5,000/month SIP ke top 3 options:\n\n🔵 Low Risk — Mirae Asset Large Cap: 11–13% avg return\n🟡 Medium Risk — Axis Midcap Fund: 15–18% avg return\n🟢 Tax Saving — Parag Parikh ELSS: ₹18,000 tax saved + 13–15% returns\n\nAapka main goal kya hai — wealth build karna ya tax bachana?" },
    { from: "user", text: "Dono chahiye — tax bhi bachana hai aur grow bhi karna hai" },
    { from: "bot", text: "Perfect split! 💡\n\n₹3,000/month → ELSS (Parag Parikh)\n• Tax benefit: ₹10,800/year saved (30% slab)\n• 3-year lock-in, 13% avg returns\n\n₹2,000/month → Mirae Asset Large Cap\n• Pure growth, no lock-in, liquidity ke liye\n\n🎯 10 saal mein estimated corpus: ₹15.2 Lakhs+\n\nKYC process shuru karoon?" },
  ],
  Cracky: [
    { from: "bot", text: "Jai ho! 📚 Main Cracky hoon — aapka exam cracker AI. NEET, JEE, UPSC, CA — personalized study plan, MCQ practice, weak topic tracking — sab handle karunga! Batao konsa exam prepare kar rahe ho?" },
    { from: "user", text: "NEET 2025 ke liye prepare kar raha hoon — Physics mein weak hoon" },
    { from: "bot", text: "NEET Physics weak? Let's fix that! 🎯\n\nSabse pehle batao — kaunsa chapter sabse zyada problem deta hai?\n\n📌 Common weak areas:\n• Electrostatics\n• Mechanics (Laws of Motion)\n• Optics\n• Modern Physics\n\nChapter batao — main personalized plan + MCQ set banata hoon! 📝" },
    { from: "user", text: "Electrostatics bahut confusing lagti hai" },
    { from: "bot", text: "Electrostatics clear karte hain! ⚡\n\n✅ 7-Day Electrostatics Plan:\n\n📅 Day 1-2: Coulomb's Law + Electric Field\n📅 Day 3: Electric Potential + Work done\n📅 Day 4: Capacitors theory\n📅 Day 5: Capacitor numericals\n📅 Day 6: Mixed MCQ practice (50 questions)\n📅 Day 7: Mock test + revision\n\n💡 NEET pe 2-3 questions Electrostatics se guaranteed aate hain!\n\nAbhi Day 1 se shuru karein? Main 10 concept MCQ bhejta hoon! 🚀" },
  ],
  Nexus: [
    { from: "bot", text: "Hey! Main Nexus hoon ⚡ — aapka master AI agent. Koi bhi kaam batao — main sahi specialist ko route karunga aur kaam karwa ke dunga." },
    { from: "user", text: "Kal presentation hai, client ko proposal bhi bhejna hai" },
    { from: "bot", text: "Got it! Routing 2 tasks simultaneously ⚡\n\n→ Prepify: Presentation practice (5 pitch questions)\n→ Gmail: Proposal draft to client\n\nDono kaam 2 min mein ready. Continue karein?" },
    { from: "user", text: "Haan, sab karo" },
    { from: "bot", text: "All tasks complete ✅\n\n🎤 Prepify — 5 pitch questions ready. Practice shuru karein?\n📧 Gmail — \"Q3 Partnership Proposal\" drafted. Review before send?" },
  ],
};

const chatHistory: Record<string, string[]> = {
  Buddy: ["Aaj ke tasks", "Meeting reminder — Zomato", "Invoice follow-up Rohan"],
  Prepify: ["Razorpay PM interview prep", "Resume review — SDE role", "Mock HR round"],
  Sellio: ["Saree listings optimize", "Competitor price analysis", "Customer reply drafts"],
  Creato: ["Diwali reel ideas", "YouTube script draft", "Instagram caption pack"],
  Finio: ["SIP planning ₹5k/month", "Tax saving ELSS options", "Monthly budget review"],
  Cracky: ["NEET Physics electrostatics", "JEE Maths integration practice", "UPSC GS Paper 2 prep"],
  Nexus: ["Interview + email tasks", "Plan launch week", "Budget review June"],
};

const LIVE_AGENTS = new Set(["sellio", "cracky"]);

// ── Countdown timer helper ────────────────────────────────────────────────────

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Limit reached modal ───────────────────────────────────────────────────────

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-4xl">🌙</div>
          <h2 className="text-lg font-semibold mt-2">Aaj ki limit ho gayi!</h2>
          <p className="text-[13px] text-muted-foreground">
            Kal reset hogi — 24 ghante baad
          </p>
        </div>

        {/* Countdown */}
        <div className="rounded-xl border border-border bg-secondary/50 p-4 text-center">
          <div className="label-xs text-muted-foreground mb-1">RESET IN</div>
          <div className="text-3xl font-mono font-medium tracking-widest text-primary">
            {formatCountdown(seconds)}
          </div>
        </div>

        {/* Referral */}
        <div className="space-y-3">
          <div className="text-center text-[13px] text-muted-foreground">
            Dost ko refer karo — dono ko <span className="text-emerald-400 font-medium">+20 messages</span> milenge! 🎁
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
            <span className="flex-1 text-center font-mono text-lg font-bold tracking-widest text-primary">
              {referralCode}
            </span>
            <button
              onClick={copy}
              className="shrink-0 h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-secondary transition"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          {copied && (
            <p className="text-center text-[12px] text-emerald-400">✓ Code copied!</p>
          )}

          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-[13px] font-medium hover:opacity-90 transition"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center text-[12px] text-muted-foreground hover:text-foreground transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const a = agents[agentIdx];
  const agentName = a.name.toLowerCase();
  const isLive = LIVE_AGENTS.has(agentName);

  const seed: Msg[] = agentSeeds[a.name] ?? [
    { from: "bot", text: `Hi! I'm ${a.name} — ${a.desc}. How can I help you today?` },
  ];

  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Daily limit state
  const [limitStatus, setLimitStatus] = useState<LimitStatusResponse | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitResetTime, setLimitResetTime] = useState<Date | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Load history
  useEffect(() => {
    if (!user || !isLive || historyLoaded) return;
    chatAPI
      .getHistory(agentName)
      .then((data) => {
        if (data.history.length > 0) {
          setMsgs(data.history.map((m) => ({ from: m.role === "user" ? "user" : "bot", text: m.content })));
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [user, isLive, agentName, historyLoaded]);

  // Fetch daily limit status
  useEffect(() => {
    if (!user || !isLive) return;
    userAPI.getLimitStatus().then(setLimitStatus).catch(() => null);
  }, [user, isLive]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSendError("");
    setMsgs((m) => [...m, { from: "user", text }]);
    setSending(true);

    if (!user || !isLive) {
      setTimeout(() => {
        setMsgs((m) => [
          ...m,
          {
            from: "bot",
            text: isLive
              ? `Got it! Working on that for you...`
              : `I'm ${a.name} — I'm in training mode right now. Full AI capabilities launching soon! 🚀\n\nFor now, you can explore the demo conversations above to see what I can do.`,
          },
        ]);
        setSending(false);
      }, 800);
      return;
    }

    try {
      const data = await chatAPI.sendMessage(agentName, text);
      setMsgs((m) => [...m, { from: "bot", text: data.reply }]);

      // Update local limit counter
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
        // Remove the user message that was optimistically added
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

  // Progress bar
  const pctUsed = limitStatus && limitStatus.totalLimit > 0
    ? limitStatus.messagesUsed / limitStatus.totalLimit
    : 0;
  const pctLeft = 1 - pctUsed;
  const barColor = pctLeft > 0.5 ? "#10b981" : pctLeft > 0.25 ? "#f59e0b" : "#ef4444";
  const textColor = pctLeft > 0.5 ? "text-emerald-400" : pctLeft > 0.25 ? "text-amber-400" : "text-red-400";

  return (
    <DashShell active={active} onNavigate={onNavigate} title={`${a.name} Chat`}>
      {showLimitModal && limitResetTime && (
        <LimitModal
          resetTime={limitResetTime}
          referralCode={limitStatus?.referralCode ?? user?.referralCode ?? "—"}
          onClose={() => setShowLimitModal(false)}
        />
      )}

      <div className="flex h-[calc(100vh-7rem)] min-h-0">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/50">
          <div className="p-3 border-b border-sidebar-border flex items-center gap-2">
            <button
              onClick={() => onNavigate("agent")}
              className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-secondary transition shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] transition"
              style={{ background: `${a.color}18`, border: `1px solid ${a.color}35`, color: a.color }}
            >
              <Plus className="h-3.5 w-3.5" /> New chat
            </button>
          </div>

          <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1">
            <div className="label-xs text-muted-foreground px-2 py-1">RECENT</div>
            {history.map((t, i) => (
              <button
                key={t}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition ${
                  i === 0 ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-sidebar-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl"
              style={{ background: `${a.color}10`, border: `1px solid ${a.color}28` }}
            >
              <div className="text-xl">{a.emoji}</div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium">{a.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{a.role}</div>
              </div>
              {!isLive && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                  DEMO
                </span>
              )}
            </div>
          </div>
        </aside>

        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate("agent")}
                className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-secondary transition lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div
                className="h-8 w-8 rounded-lg grid place-items-center text-base"
                style={{ background: `${a.color}22`, border: `1px solid ${a.color}40` }}
              >
                {a.emoji}
              </div>
              <div>
                <div className="text-[14px] font-medium leading-tight flex items-center gap-2">
                  {a.name}
                  {!isLive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      DEMO MODE
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-1 label-xs" style={{ color: a.color }}>
                  <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: a.color }} />
                  {a.role.toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate("connections")}
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition"
            >
              <Settings2 className="h-3.5 w-3.5" /> Settings
            </button>
          </div>

          {/* Daily limit bar */}
          {user && isLive && limitStatus && (
            <div className="px-4 py-2 border-b border-border bg-background/60 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-medium ${textColor}`}>
                  {limitStatus.messagesLeft} messages remaining today
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {limitStatus.messagesUsed} / {limitStatus.totalLimit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pctUsed * 100)}%`, background: barColor }}
                />
              </div>
            </div>
          )}

          {/* Demo mode banner */}
          {!isLive && (
            <div className="px-4 py-2 flex items-center gap-2 border-b border-border bg-amber-500/5 text-[12px] text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {a.name} AI is in training — showing demo conversations. Live AI launching soon!
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-auto scrollbar-thin p-4 sm:p-6 space-y-4">
            {msgs.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="flex justify-end fade-in">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-[14px]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3 fade-in">
                  <div
                    className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0 mt-0.5"
                    style={{ background: `${a.color}22`, border: `1px solid ${a.color}40` }}
                  >
                    {a.emoji}
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-[14px] whitespace-pre-line">
                    {m.text}
                  </div>
                </div>
              )
            )}

            {sending && (
              <div className="flex gap-3 fade-in">
                <div
                  className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0"
                  style={{ background: `${a.color}22`, border: `1px solid ${a.color}40` }}
                >
                  {a.emoji}
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {sendError && (
            <div className="px-4 py-2 flex items-center gap-2 border-t border-border bg-red-500/5 text-[12px] text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {sendError}
              <button onClick={() => setSendError("")} className="ml-auto text-[11px] underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 shrink-0">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
              <button className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground transition">
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
                placeholder={!user ? "Log in to chat with a live agent..." : `Ask ${a.name} anything...`}
                className="flex-1 resize-none bg-transparent outline-none text-[14px] py-1.5 px-1 max-h-32"
                disabled={sending}
              />
              <button className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground transition">
                <Mic className="h-4 w-4" />
              </button>
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="h-8 w-8 grid place-items-center rounded-lg text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: a.color }}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            {!user && (
              <p className="text-center text-[11px] text-muted-foreground mt-2">
                <button onClick={() => onNavigate("landing")} className="text-primary hover:underline">
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
