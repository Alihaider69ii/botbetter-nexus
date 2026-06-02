import { useRef, useState, useEffect, useMemo } from "react";
import { ScreenKey } from "../TopNav";
import {
  ArrowRight, MessageSquare, Mail, Calendar, Send, Slack,
  CheckCircle2, Zap, GraduationCap, DollarSign, Activity,
  Video, PlusCircle, Bell, Code2, ShoppingCart, ShoppingBag,
  TrendingUp, Play, FileText, Palette, Camera, Smartphone,
  Sparkles, Bot, ChevronRight, CreditCard, Database, Users,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────── *
 *  HOOKS
 * ─────────────────────────────────────────────────────────── */
function useInView(threshold = 0.14) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v] as const;
}

function useCounter(target: number, ms = 2200, on = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t0 = performance.now();
    const f = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      setN(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) requestAnimationFrame(f); else setN(target);
    };
    requestAnimationFrame(f);
  }, [on, target, ms]);
  return n;
}

/* ─────────────────────────────────────────────────────────── *
 *  STAR FIELD
 * ─────────────────────────────────────────────────────────── */
const StarField = ({ n = 90 }: { n?: number }) => {
  const stars = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 2.5 + 0.5,
      d: Math.random() * 12 + 5,
      delay: Math.random() * 8,
      op: Math.random() * 0.6 + 0.25,
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.s, height: p.s,
            animation: `bb-twinkle ${p.d}s ${p.delay}s ease-in-out infinite`,
            ["--max-op" as string]: p.op,
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── *
 *  NEXUS ORB  (pure CSS — reused across sections)
 * ─────────────────────────────────────────────────────────── */
const NexusOrb = ({ size = 180, rings = 2 }: { size?: number; rings?: number }) => {
  const particles = useMemo(() => [
    { r: size * 0.8,  dur: 10, del: 0,    sz: 5,   col: "#7C6BFF" },
    { r: size * 0.95, dur: 16, del: -5.3, sz: 3.5, col: "#a78bfa" },
    { r: size * 0.7,  dur: 8,  del: -2.1, sz: 4,   col: "#7C6BFF" },
    { r: size * 1.1,  dur: 22, del: -9,   sz: 3,   col: "#c4b5fd" },
    { r: size * 0.85, dur: 14, del: -3.5, sz: 4.5, col: "#7C6BFF" },
    { r: size * 1.0,  dur: 18, del: -7,   sz: 3,   col: "#a78bfa" },
  ], [size]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2.4, height: size * 2.4 }}>
      {/* Orbit ring decorations */}
      {rings >= 1 && (
        <div className="absolute rounded-full border border-purple-500/15"
          style={{ width: size * 1.7, height: size * 1.7, animation: "bb-ring-spin 20s linear infinite" }} />
      )}
      {rings >= 2 && (
        <div className="absolute rounded-full border border-purple-400/10"
          style={{ width: size * 2.1, height: size * 2.1, animation: "bb-ring-spin 32s linear reverse infinite" }} />
      )}

      {/* Orbit particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: "50%", left: "50%",
            marginTop: -(p.sz / 2), marginLeft: -(p.sz / 2),
            width: p.sz, height: p.sz,
            background: p.col,
            boxShadow: `0 0 ${p.sz * 2}px ${p.col}`,
            ["--r" as string]: `${p.r}px`,
            animation: `bb-orbit ${p.dur}s linear ${p.del}s infinite`,
          }}
        />
      ))}

      {/* Outer glow layers */}
      <div className="absolute rounded-full"
        style={{ width: size * 1.5, height: size * 1.5, background: "radial-gradient(circle, rgba(124,107,255,0.18) 0%, transparent 70%)" }} />
      <div className="absolute rounded-full"
        style={{ width: size, height: size, background: "radial-gradient(circle, rgba(124,107,255,0.28) 0%, transparent 70%)" }} />

      {/* Core orb */}
      <div
        className="relative z-10 rounded-full flex items-center justify-center"
        style={{
          width: size, height: size,
          background: "radial-gradient(circle at 32% 28%, #9B8FFF 0%, #7C6BFF 45%, #4C3DBF 80%, #2A1A90 100%)",
          animation: "bb-heartbeat 2.4s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: size * 0.28 }}>⚡</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── *
 *  AGENT CARD (CSS 3D flip)
 * ─────────────────────────────────────────────────────────── */
const AGENTS = [
  { emoji: "⚡", name: "Nexus",   role: "Master Orchestrator", col: "#7C6BFF", caps: ["Routes all commands intelligently", "Runs tasks in background", "Remembers your preferences"] },
  { emoji: "🤖", name: "Buddy",   role: "Personal Assistant",  col: "#3B82F6", caps: ["WhatsApp & Telegram messages", "Schedule & reminders", "Email drafting & replies"] },
  { emoji: "🎤", name: "Prepify", role: "Interview Coach",     col: "#22C55E", caps: ["AI mock interviews", "Resume analysis & tips", "Career roadmap in Hindi"] },
  { emoji: "🛒", name: "Sellio",  role: "E-Commerce AI",       col: "#F97316", caps: ["Auto-write product listings", "Price & competitor analysis", "Customer reply automation"] },
  { emoji: "🎬", name: "Creato",  role: "Content Creator",     col: "#EC4899", caps: ["Reel scripts & video ideas", "Social media captions", "Content calendar planning"] },
  { emoji: "💰", name: "Finio",   role: "Finance Advisor",     col: "#14B8A6", caps: ["Budget & expense tracking", "SIP & investment advice", "Tax saving in Hinglish"] },
  { emoji: "📚", name: "Cracky",  role: "Exam Cracker",        col: "#F59E0B", caps: ["NEET, JEE, UPSC prep", "Custom study schedules", "Practice tests & MCQs"] },
  { emoji: "💪", name: "FlexAI",  role: "Fitness Coach",       col: "#EF4444", caps: ["Indian-diet meal plans", "Personalized workout plans", "Progress tracking & adjustments"] },
];

const AgentCard3D = ({ agent, delay = 0 }: { agent: typeof AGENTS[0]; delay?: number }) => (
  <div
    className="bb-card-wrap"
    style={{ height: 260, perspective: 1000, animationDelay: `${delay}ms` }}
  >
    <div className="bb-card-inner w-full h-full">
      {/* Front */}
      <div
        className="bb-card-face absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-5 cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: `1px solid rgba(255,255,255,0.07)`,
        }}
      >
        <div
          className="text-5xl"
          style={{ animation: `bb-float ${5 + (delay % 3)}s ease-in-out ${delay * 0.003}s infinite`, display: "inline-block" }}
        >
          {agent.emoji}
        </div>
        <div className="text-center">
          <div className="text-white font-bold text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>{agent.name}</div>
          <div className="text-slate-400 text-xs mt-0.5">{agent.role}</div>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: `${agent.col}18`, color: agent.col, border: `1px solid ${agent.col}35` }}
        >
          Hover to explore →
        </div>
      </div>

      {/* Back */}
      <div
        className="bb-card-face bb-card-back absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
        style={{
          background: `linear-gradient(135deg, ${agent.col}16, rgba(10,10,15,0.97))`,
          border: `1px solid ${agent.col}45`,
          boxShadow: `0 0 50px ${agent.col}28`,
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{agent.emoji}</span>
            <div>
              <div className="text-white font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>{agent.name}</div>
              <div className="text-xs font-medium" style={{ color: agent.col }}>{agent.role}</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {agent.caps.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: agent.col }} />
              {c}
            </li>
          ))}
        </ul>
        <div
          className="mt-3 text-center text-xs font-semibold py-2 rounded-xl"
          style={{ background: `${agent.col}20`, color: agent.col }}
        >
          Coming to Nexus →
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────── *
 *  CONNECTOR DATA
 * ─────────────────────────────────────────────────────────── */
const CONNECTORS = [
  { group: "Communication",  items: [
    { n: "WhatsApp",  Icon: MessageSquare, c: "#25D366" },
    { n: "Telegram",  Icon: Send,          c: "#2AABEE" },
    { n: "Gmail",     Icon: Mail,          c: "#EA4335" },
    { n: "Slack",     Icon: Slack,         c: "#E01E5A" },
  ]},
  { group: "Productivity",   items: [
    { n: "Calendar",  Icon: Calendar,      c: "#4285F4" },
    { n: "Notion",    Icon: FileText,      c: "#ffffff" },
    { n: "Drive",     Icon: Database,      c: "#34A853" },
  ]},
  { group: "Creative",       items: [
    { n: "Canva",     Icon: Palette,       c: "#00C4CC" },
    { n: "Figma",     Icon: Sparkles,      c: "#A259FF" },
    { n: "Adobe",     Icon: Zap,           c: "#FF0000" },
  ]},
  { group: "Business",       items: [
    { n: "Razorpay",  Icon: CreditCard,    c: "#3395FF" },
    { n: "Amazon",    Icon: ShoppingCart,  c: "#FF9900" },
    { n: "Meesho",    Icon: ShoppingBag,   c: "#B03DE3" },
    { n: "Zerodha",   Icon: TrendingUp,    c: "#387ED1" },
  ]},
  { group: "Social",         items: [
    { n: "Instagram", Icon: Camera,        c: "#E1306C" },
    { n: "YouTube",   Icon: Video,         c: "#FF0000" },
    { n: "Twitter/X", Icon: MessageSquare, c: "#000000" },
  ]},
  { group: "Developer",      items: [
    { n: "GitHub",    Icon: Code2,         c: "#ffffff" },
    { n: "Vercel",    Icon: Zap,           c: "#ffffff" },
    { n: "REST API",  Icon: Activity,      c: "#7C6BFF" },
  ]},
];

/* ─────────────────────────────────────────────────────────── *
 *  MAIN LANDING
 * ─────────────────────────────────────────────────────────── */
export const Landing = ({
  onNavigate,
  onShowAuth,
}: {
  onNavigate: (s: ScreenKey) => void;
  onShowAuth: (tab: "login" | "signup") => void;
}) => {
  /* section view refs */
  const [diffRef,    diffIn]    = useInView();
  const [howRef,     howIn]     = useInView();
  const [agRef,      agIn]      = useInView();
  const [agentRef,   agentIn]   = useInView();
  const [accRef,     accIn]     = useInView();
  const [connRef,    connIn]    = useInView();
  const [createRef,  createIn]  = useInView();
  const [statsRef,   statsIn]   = useInView();
  const [ctaRef,     ctaIn]     = useInView();

  /* animated counters */
  const c1 = useCounter(8,  2000, statsIn);
  const c2 = useCounter(15, 2200, statsIn);
  const c3 = useCounter(50, 1800, statsIn);
  const commCount = useCounter(12840, 3500, createIn);

  /* cycling "how it works" example */
  const HINGLISH = [
    { cmd: '"Raj ko message bhejo — aaj meeting 4 baje hai"',  a1: "Buddy", r1: "WhatsApp sent to Raj ✓",       a2: "Buddy",   r2: "Meeting reminder set ✓",    a3: null, r3: null },
    { cmd: '"Mera NEET schedule banao — exam 3 mahine mein"',  a1: "Cracky", r1: "Custom 90-day plan ready ✓",   a2: null,      r2: null,                         a3: null, r3: null },
    { cmd: '"Meri Amazon listing optimize karo"',              a1: "Sellio", r1: "7 listings improved ✓",        a2: "Sellio",  r2: "Competitor prices fetched ✓", a3: null, r3: null },
  ];
  const [hIdx, setHIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHIdx(i => (i + 1) % HINGLISH.length), 3800);
    return () => clearInterval(id);
  }, []);

  /* create agent preview */
  const [agentName, setAgentName] = useState("ShopBot");
  const [agentRole, setAgentRole] = useState("E-Commerce Helper");
  const [published, setPublished] = useState(false);

  return (
    <div className="bb-root min-h-screen text-slate-200 overflow-x-hidden" style={{ background: "#0A0A0F" }}>

      {/* ══════════════════ GLOBAL STYLES ══════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        .bb-root { font-family: 'Inter', sans-serif; }
        .bb-outfit { font-family: 'Outfit', sans-serif; }

        /* ── Text gradient ── */
        .bb-grad {
          background: linear-gradient(135deg, #7C6BFF 0%, #a78bfa 45%, #38bdf8 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 200% 200%; animation: bb-grad-shift 5s ease infinite;
        }
        @keyframes bb-grad-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        /* ── Grid bg ── */
        .bb-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        /* ── Orb heartbeat ── */
        @keyframes bb-heartbeat {
          0%,100% {
            box-shadow: 0 0 40px #7C6BFF80, 0 0 80px #7C6BFF45, 0 0 150px #7C6BFF20;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 75px #7C6BFFC0, 0 0 140px #7C6BFF70, 0 0 240px #7C6BFF45;
            transform: scale(1.07);
          }
        }

        /* ── Star twinkle ── */
        @keyframes bb-twinkle {
          0%,100% { opacity: 0.08; transform: scale(1); }
          50%      { opacity: var(--max-op, 0.65); transform: scale(1.3); }
        }

        /* ── Orbit ── */
        @keyframes bb-orbit {
          from { transform: rotate(0deg)   translateX(var(--r, 130px)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--r, 130px)) rotate(-360deg); }
        }

        /* ── Ring spin ── */
        @keyframes bb-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Float ── */
        @keyframes bb-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-11px); }
        }

        /* ── Fade up ── */
        @keyframes bb-fade-up {
          from { opacity: 0; transform: translateY(38px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Scale in ── */
        @keyframes bb-scale-in {
          from { opacity: 0; transform: scale(0.55) translateY(20px); filter: blur(12px); }
          70%  { opacity: 1; transform: scale(1.04) translateY(0); filter: blur(0); }
          to   { transform: scale(1); }
        }

        /* ── Slide left/right ── */
        @keyframes bb-slide-l { from{opacity:0;transform:translateX(-55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes bb-slide-r { from{opacity:0;transform:translateX(55px)}  to{opacity:1;transform:translateX(0)} }

        /* ── Pop in ── */
        @keyframes bb-pop { from{opacity:0;transform:scale(0.65)} to{opacity:1;transform:scale(1)} }

        /* ── Chaos float variations ── */
        @keyframes bb-chaos-a { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(1.5deg)} }
        @keyframes bb-chaos-b { 0%,100%{transform:translateY(-5px) rotate(2deg)} 50%{transform:translateY(9px) rotate(-2.5deg)} }
        @keyframes bb-chaos-c { 0%,100%{transform:translateY(3px) rotate(-1.5deg)} 50%{transform:translateY(-11px) rotate(3deg)} }
        @keyframes bb-chaos-d { 0%,100%{transform:translateY(-8px) rotate(2.5deg)} 50%{transform:translateY(5px) rotate(-1deg)} }

        /* ── Flow line ── */
        @keyframes bb-line { from{width:0;opacity:0} to{opacity:1} }
        @keyframes bb-dash-flow {
          to { stroke-dashoffset: -20; }
        }

        /* ── Connector in ── */
        @keyframes bb-conn { from{opacity:0;transform:scale(0.55) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }

        /* ── Pulse dot ── */
        @keyframes bb-dot { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }

        /* ── Card 3D ── */
        .bb-card-wrap { display: block; }
        .bb-card-inner {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.23,1,0.32,1);
        }
        .bb-card-wrap:hover .bb-card-inner { transform: rotateY(180deg); }
        .bb-card-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .bb-card-back { transform: rotateY(180deg); }

        /* ── Anim helpers ── */
        .bb-in { animation: bb-fade-up 0.7s cubic-bezier(.16,1,.3,1) both; }
        .bb-in-l { animation: bb-slide-l 0.7s cubic-bezier(.16,1,.3,1) both; }
        .bb-in-r { animation: bb-slide-r 0.7s cubic-bezier(.16,1,.3,1) both; }
        .bb-pop  { animation: bb-pop 0.6s cubic-bezier(.16,1,.3,1) both; }
        .bb-scale-enter { animation: bb-scale-in 1s cubic-bezier(.16,1,.3,1) both; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 5px; background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(124,107,255,0.3); border-radius: 3px; }
      `}</style>

      {/* Fixed grid overlay */}
      <div className="fixed inset-0 bb-grid pointer-events-none z-0"
        style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, black 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, black 100%)" }} />

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §1  HERO                                           ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ paddingTop: 80 }}>
        <StarField n={100} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(10,10,15,0.85) 100%)" }} />

        {/* Orb — center stage */}
        <div className="relative z-20 flex flex-col items-center text-center px-6">
          <div className="bb-scale-enter" style={{ animationDelay: "0s" }}>
            <NexusOrb size={160} rings={2} />
          </div>

          {/* Badge */}
          <div
            className="bb-in inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mt-2 mb-4"
            style={{ animationDelay: "0.3s", background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.3)", color: "#a78bfa" }}
          >
            <span className="w-2 h-2 rounded-full bg-violet-400" style={{ animation: "bb-dot 1.8s ease-in-out infinite" }} />
            India's First Agentic AI Platform
          </div>

          {/* Headline */}
          <h1
            className="bb-in bb-outfit font-black text-white leading-[1.03] tracking-tight mb-5"
            style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)", animationDelay: "0.45s" }}
          >
            This is <span className="bb-grad">Nexus.</span>
          </h1>

          <p
            className="bb-in text-slate-300 text-lg sm:text-xl max-w-2xl leading-relaxed mb-3"
            style={{ animationDelay: "0.6s" }}
          >
            Not just AI. Not just chatbots.<br />
            <strong className="text-white">An agent that actually acts.</strong>
          </p>

          <p
            className="bb-in text-slate-500 text-base max-w-xl leading-relaxed mb-10"
            style={{ animationDelay: "0.7s" }}
          >
            Nexus understands what you want, decides which specialist to use, and executes — all while you do something else. One command. Infinite actions.
          </p>

          <div className="bb-in flex flex-col sm:flex-row items-center gap-4" style={{ animationDelay: "0.85s" }}>
            <button
              onClick={() => onShowAuth("signup")}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7C6BFF, #5040CC)", boxShadow: "0 0 50px rgba(124,107,255,0.5)" }}
            >
              Experience Nexus
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Play className="w-4 h-4 text-violet-400" />
              Watch how it works
            </button>
          </div>

          {/* Sub-labels */}
          <div className="bb-in flex items-center gap-6 mt-8 text-xs text-slate-600" style={{ animationDelay: "1s" }}>
            {["50 free messages/day", "No credit card", "WhatsApp native"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-violet-500" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
          style={{ animation: "bb-fade-up 1s 1.2s ease both" }}>
          <div className="text-slate-600 text-xs tracking-widest uppercase">Scroll</div>
          <div style={{ width: 1, height: 45, background: "linear-gradient(to bottom, rgba(124,107,255,0.7), transparent)" }} />
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §2  THE DIFFERENCE                                 ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-28 px-6 max-w-6xl mx-auto" ref={diffRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-16 ${diffIn ? "bb-in" : "opacity-0"}`}>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Stop switching.<br /><span className="bb-grad">Start delegating.</span></h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">The difference isn't just features. It's the entire mental model.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT — Chaos */}
          <div className={`rounded-3xl p-8 relative overflow-hidden ${diffIn ? "bb-in-l" : "opacity-0"}`}
            style={{ background: "rgba(255,60,60,0.04)", border: "1px solid rgba(255,60,60,0.15)", animationDelay: "0.15s" }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20">The Old Way</div>

            {/* Tool chaos grid */}
            <div className="relative h-52 mb-8 flex items-center justify-center">
              {[
                { n: "ChatGPT", c: "#10A37F", anim: "bb-chaos-a", del: "0s",    top: "10%",  left: "5%" },
                { n: "Claude",  c: "#D97706", anim: "bb-chaos-b", del: "0.8s",  top: "8%",   right: "8%" },
                { n: "Gemini",  c: "#4285F4", anim: "bb-chaos-c", del: "1.4s",  bot: "12%",  left: "8%" },
                { n: "Copilot", c: "#E1306C", anim: "bb-chaos-d", del: "0.4s",  bot: "10%",  right: "5%" },
              ].map(({ n, c, anim, del, top, left, bot, right }: any) => (
                <div
                  key={n}
                  className="absolute px-4 py-2 rounded-xl text-sm font-bold"
                  style={{
                    background: `${c}15`, border: `1px solid ${c}40`, color: c,
                    top, left, bottom: bot, right,
                    animation: `${anim} ${5 + Math.random() * 3}s ease-in-out ${del} infinite`,
                    filter: "blur(0.3px)",
                  }}
                >
                  {n}
                </div>
              ))}

              {/* Frazzled user */}
              <div className="rounded-2xl px-5 py-4 text-center z-10"
                style={{ background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.25)" }}>
                <div className="text-3xl mb-1">😵</div>
                <div className="text-white font-bold text-sm">You</div>
                <div className="text-red-400 text-xs mt-0.5">doing everything manually</div>
              </div>

              {/* Chaotic dashes (borders as decorative lines) */}
              {["-40px, -35px", "45px, -30px", "-42px, 38px", "48px, 35px"].map((pos, i) => (
                <div key={i} className="absolute w-8 h-px"
                  style={{ top: `calc(50% + ${pos.split(",")[1]})`, left: `calc(50% + ${pos.split(",")[0]})`,
                    borderTop: "1.5px dashed rgba(255,100,100,0.4)", transform: `rotate(${i * 45}deg)` }} />
              ))}
            </div>

            <ul className="space-y-3">
              {[
                "Switch between 5+ different AI tools",
                "Copy-paste your context every single time",
                "No memory — explain yourself repeatedly",
                "Pay 4 separate monthly subscriptions",
                "Nothing actually executes for you",
              ].map(t => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-red-400 mt-0.5">✗</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Order */}
          <div className={`rounded-3xl p-8 relative overflow-hidden ${diffIn ? "bb-in-r" : "opacity-0"}`}
            style={{ background: "rgba(124,107,255,0.05)", border: "1px solid rgba(124,107,255,0.25)", boxShadow: "0 0 60px rgba(124,107,255,0.1)", animationDelay: "0.25s" }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20">BotBetter Way</div>

            {/* Nexus + agents */}
            <div className="relative h-52 mb-8 flex items-center justify-center">
              {/* Connection lines to agents */}
              {[
                { top: "12%", left: "18%",  label: "Buddy",   col: "#3B82F6" },
                { top: "12%", right: "18%", label: "Sellio",  col: "#F97316" },
                { bot: "12%", left: "18%",  label: "Cracky",  col: "#F59E0B" },
                { bot: "12%", right: "18%", label: "Prepify", col: "#22C55E" },
              ].map(({ label, col, top, left, bot, right }: any) => (
                <div
                  key={label}
                  className="absolute w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    top, left, bottom: bot, right,
                    background: `${col}18`, border: `1px solid ${col}40`, color: col,
                    animation: "bb-float 5s ease-in-out infinite",
                    boxShadow: `0 0 16px ${col}25`,
                  }}
                >
                  {label[0]}
                </div>
              ))}

              {/* Central Nexus */}
              <div
                className="z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #9B8FFF, #7C6BFF 50%, #4C3DBF)",
                  boxShadow: "0 0 40px rgba(124,107,255,0.7), 0 0 80px rgba(124,107,255,0.35)",
                  animation: "bb-heartbeat 2.4s ease-in-out infinite",
                }}
              >
                <span className="text-2xl">⚡</span>
                <span className="text-white text-xs font-bold mt-0.5">NEXUS</span>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "One command. Nexus routes to the right agent",
                "Remembers you — no context needed twice",
                "Executes tasks while you're away",
                "Single subscription. All 8 agents included",
                "Results delivered to your WhatsApp",
              ].map(t => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §3  HOW NEXUS WORKS                                ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto" ref={howRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${howIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7C6BFF" }}>How it works</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">One command.<br />Everything happens.</h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Nexus doesn't just answer — it acts. Here's what happens in the background.</p>
        </div>

        {/* Flow diagram */}
        <div className={`rounded-3xl overflow-hidden ${howIn ? "bb-in" : "opacity-0"}`}
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", animationDelay: "0.2s" }}>

          {/* Cycling example input */}
          <div className="border-b border-white/6 px-8 py-6">
            <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">Live example (auto-cycling)</div>
            <div key={hIdx} className="flex items-center gap-3" style={{ animation: "bb-fade-up 0.5s ease both" }}>
              <span className="text-xs px-2 py-0.5 rounded font-mono text-violet-300 bg-violet-500/10">You →</span>
              <span className="text-white font-medium text-sm sm:text-base">{HINGLISH[hIdx].cmd}</span>
            </div>
          </div>

          {/* Steps */}
          <div className="p-8 space-y-0">
            {/* Step 1: Nexus processes */}
            <div className={`flex items-start gap-5 mb-8 ${howIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold font-outline text-sm"
                style={{ background: "rgba(124,107,255,0.2)", border: "1px solid rgba(124,107,255,0.4)", color: "#a78bfa" }}>1</div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                    style={{ background: "radial-gradient(circle, #7C6BFF, #4C3DBF)", boxShadow: "0 0 15px rgba(124,107,255,0.6)", animation: "bb-heartbeat 2.4s ease-in-out infinite" }}>⚡</div>
                  <div>
                    <span className="text-white font-semibold">Nexus understands intent</span>
                    <span className="text-slate-500 text-xs ml-2">in milliseconds</span>
                  </div>
                </div>
                <div className="mt-2 ml-11 text-xs text-slate-500">Natural language → parsed intent → agent routing decision</div>
              </div>
            </div>

            {/* Divider line */}
            <div className="ml-4 w-0.5 h-6 mb-2" style={{ background: "rgba(124,107,255,0.3)" }} />

            {/* Step 2: Parallel dispatch */}
            <div className={`flex items-start gap-5 mb-8 ${howIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.45s" }}>
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "rgba(124,107,255,0.2)", border: "1px solid rgba(124,107,255,0.4)", color: "#a78bfa" }}>2</div>
              <div className="flex-1">
                <div className="text-white font-semibold mb-3">Dispatches to specialist agents (simultaneously)</div>
                <div key={hIdx} className="flex flex-col sm:flex-row gap-3" style={{ animation: "bb-fade-up 0.5s ease both" }}>
                  {[
                    { a: HINGLISH[hIdx].a1, r: HINGLISH[hIdx].r1 },
                    ...(HINGLISH[hIdx].a2 ? [{ a: HINGLISH[hIdx].a2, r: HINGLISH[hIdx].r2 }] : []),
                  ].filter(x => x.a).map(({ a, r }, i) => {
                    const ag = AGENTS.find(ag => ag.name === a);
                    return (
                      <div key={i} className="flex-1 rounded-xl px-4 py-3 flex items-center gap-3"
                        style={{ background: `${ag?.col || "#7C6BFF"}12`, border: `1px solid ${ag?.col || "#7C6BFF"}35` }}>
                        <span className="text-lg">{ag?.emoji}</span>
                        <div>
                          <div className="text-white text-xs font-semibold">{a}</div>
                          <div className="text-xs mt-0.5 font-medium" style={{ color: ag?.col || "#7C6BFF" }}>{r}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="ml-4 w-0.5 h-6 mb-2" style={{ background: "rgba(124,107,255,0.3)" }} />

            {/* Step 3: Delivered */}
            <div className={`flex items-start gap-5 ${howIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.6s" }}>
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}>3</div>
              <div>
                <div className="text-white font-semibold flex items-center gap-2">
                  Result delivered to your WhatsApp
                  <span className="text-xs px-2 py-0.5 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/25">you don't even need to check app</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">Nexus notifies you when done. No app needed. Just WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §4  THE PLATFORM IS AGENTIC                        ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={agRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-16 ${agIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#7C6BFF" }}>The core difference</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-6">
            The platform itself<br /><span className="bb-grad">thinks.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Traditional tools make <em>you</em> do the thinking. BotBetter's platform understands, decides, and executes — like a team of experts on standby.
          </p>
        </div>

        {/* Comparison rows */}
        <div className={`grid sm:grid-cols-2 gap-6 mb-10 ${agIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
          <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="text-red-400 font-semibold text-sm mb-4 uppercase tracking-widest">Traditional AI tool</div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 font-mono">You</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="px-3 py-1.5 rounded-lg bg-white/5 font-mono">Prompt Tool</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="px-3 py-1.5 rounded-lg bg-white/5 font-mono">Result</span>
            </div>
            <p className="text-slate-500 text-xs mt-3">You do all the thinking. It just generates text.</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "rgba(124,107,255,0.06)", border: "1px solid rgba(124,107,255,0.25)", boxShadow: "0 0 30px rgba(124,107,255,0.08)" }}>
            <div className="text-violet-300 font-semibold text-sm mb-4 uppercase tracking-widest">BotBetter Nexus</div>
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <span className="px-3 py-1.5 rounded-lg font-mono" style={{ background: "rgba(124,107,255,0.15)", color: "#c4b5fd" }}>You</span>
              <ChevronRight className="w-4 h-4 text-violet-500" />
              <span className="px-3 py-1.5 rounded-lg font-mono" style={{ background: "rgba(124,107,255,0.15)", color: "#c4b5fd" }}>Nexus thinks</span>
              <ChevronRight className="w-4 h-4 text-violet-500" />
              <span className="px-3 py-1.5 rounded-lg font-mono text-emerald-300" style={{ background: "rgba(16,185,129,0.1)" }}>Done ✓</span>
            </div>
            <p className="text-violet-300/60 text-xs mt-3">Platform decides everything. You just live.</p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: "🧠", title: "Understands your intent",     desc: "No need for perfect prompts. Nexus gets what you mean." },
            { emoji: "🎯", title: "Picks the right agent",       desc: "Automatically routes to the specialist that fits the task." },
            { emoji: "⚡", title: "Executes the task",           desc: "Doesn't just suggest — actually sends that WhatsApp, sets that meeting." },
            { emoji: "📱", title: "Reports back to you",         desc: "Sends results to your WhatsApp. No app-switching needed." },
            { emoji: "💾", title: "Remembers your preferences",  desc: "Knows your language, style, and habits over time." },
            { emoji: "📈", title: "Gets smarter over time",      desc: "Learns from every interaction to serve you better." },
          ].map((f, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 transition-all hover:-translate-y-1 ${agIn ? "bb-pop" : "opacity-0"}`}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: `${0.05 * i + 0.35}s`,
              }}
            >
              <span className="text-2xl mb-3 block">{f.emoji}</span>
              <div className="text-white font-semibold text-sm mb-1">{f.title}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §5  8 SPECIALIST AGENTS                            ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-6xl mx-auto" ref={agentRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${agentIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7C6BFF" }}>Meet the team</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">8 minds.<br />One platform.</h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Each agent is a specialist. Hover any card to see what it can do.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => (
            <div key={agent.name} className={agentIn ? "bb-pop" : "opacity-0"} style={{ animationDelay: `${i * 0.08}s` }}>
              <AgentCard3D agent={agent} delay={i * 80} />
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className={`mt-6 ${agentIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.7s" }}>
          <div className="text-center text-slate-500 text-sm mb-4">+ More agents launching every month</div>
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {["LegalAI", "HealthAI", "TravelAI"].map(n => (
              <div key={n} className="rounded-2xl p-5 flex flex-col items-center gap-2"
                style={{ background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.08)", filter: "blur(0.4px)" }}>
                <div className="text-2xl opacity-40">🔒</div>
                <div className="text-slate-500 text-sm font-medium">{n}</div>
                <div className="text-xs text-slate-600">Coming soon</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §6  ACCESS ANYWHERE                                ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-24 px-6 overflow-hidden" ref={accRef as React.RefObject<HTMLDivElement>}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${accIn ? "bb-in" : "opacity-0"}`}>
            <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7C6BFF" }}>Anywhere. Anytime.</div>
            <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Nexus lives<br />where you live.</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">No need to open any app. Just message Nexus on WhatsApp or Telegram like you message a friend.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Phone 1 — WhatsApp */}
            <div className={`${accIn ? "bb-in-l" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
              <div
                style={{
                  width: 210,
                  height: 420,
                  border: "2.5px solid rgba(255,255,255,0.14)",
                  borderRadius: 38,
                  background: "#0D0D18",
                  padding: "16px 12px",
                  boxShadow: "0 0 70px rgba(37,211,102,0.12), 0 50px 80px rgba(0,0,0,0.5)",
                  animation: "bb-float 6s ease-in-out infinite",
                }}
              >
                <div style={{ width: 70, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", margin: "0 auto 14px" }} />
                {/* WA header */}
                <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-3"
                  style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{ background: "rgba(37,211,102,0.3)" }}>⚡</div>
                  <div>
                    <div style={{ color: "#25D366", fontSize: 11, fontWeight: 700 }}>Nexus</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>online • BotBetter AI</div>
                  </div>
                </div>
                {/* Conversation */}
                {[
                  { m: "Bhai aaj ka news kya hai aur mera 3pm meeting remind karna", self: true },
                  { m: "India market 1.2% upar 📈 \n3pm reminder set kar diya! ✓", self: false },
                  { m: "Raj ko bata do meeting postpone hai", self: true },
                  { m: "Raj ko WhatsApp kar diya ✓", self: false },
                ].map((b, i) => (
                  <div key={i} className="mb-2" style={{ display: "flex", justifyContent: b.self ? "flex-end" : "flex-start" }}>
                    <div style={{
                      background: b.self ? "rgba(124,107,255,0.25)" : "rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "5px 9px",
                      fontSize: 8.5, color: b.self ? "#c4b5fd" : "rgba(255,255,255,0.7)",
                      maxWidth: "80%", whiteSpace: "pre-line",
                    }}>{b.m}</div>
                  </div>
                ))}
                <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginTop: 4 }} />
                <div className="text-center mt-3" style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>WhatsApp</div>
              </div>
            </div>

            {/* Laptop — web dashboard */}
            <div className={`${accIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0s" }}>
              <div style={{ animation: "bb-float 7.5s 1s ease-in-out infinite" }}>
                <div style={{
                  width: 440,
                  height: 280,
                  border: "2px solid rgba(255,255,255,0.12)",
                  borderRadius: "14px 14px 0 0",
                  background: "#0D0D18",
                  padding: 14,
                  boxShadow: "0 0 80px rgba(124,107,255,0.15)",
                }}>
                  {/* Browser bar */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex gap-1.5">
                      {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
                    </div>
                    <div style={{ flex: 1, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.05)", paddingLeft: 8, display: "flex", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>app.botbetter.in/nexus</span>
                    </div>
                  </div>
                  {/* Dashboard */}
                  <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8, height: "calc(100% - 28px)" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 8 }}>
                      {["⚡ Nexus","🤖 Buddy","📚 Cracky","🛒 Sellio"].map((a, i) => (
                        <div key={i} style={{
                          padding: "5px 6px", borderRadius: 6, marginBottom: 3,
                          background: i === 0 ? "rgba(124,107,255,0.2)" : "transparent",
                          color: i === 0 ? "#c4b5fd" : "rgba(255,255,255,0.3)", fontSize: 9
                        }}>{a}</div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      {[
                        { t: "Meri UPSC preparation plan banao", s: true },
                        { t: "3-month schedule ready! 4hrs/day plan sent to WhatsApp ✓", s: false },
                        { t: "Timetable thoda easy karo weekend pe", s: true },
                        { t: "Weekend 2hrs kar diya ✓", s: false },
                      ].map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.s ? "flex-end" : "flex-start", marginBottom: 4 }}>
                          <div style={{
                            background: m.s ? "rgba(124,107,255,0.22)" : "rgba(255,255,255,0.06)",
                            borderRadius: 8, padding: "3px 7px",
                            fontSize: 7.5, color: m.s ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                            maxWidth: "85%",
                          }}>{m.t}</div>
                        </div>
                      ))}
                      <div style={{ height: 20, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                  </div>
                </div>
                <div style={{ width: 480, height: 14, background: "rgba(255,255,255,0.06)", borderRadius: "0 0 6px 6px", margin: "0 auto" }} />
                <div style={{ width: 130, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: "0 0 8px 8px", margin: "0 auto" }} />
                <div className="text-center mt-4" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Web Dashboard</div>
              </div>
            </div>

            {/* Phone 2 — Telegram */}
            <div className={`hidden lg:block ${accIn ? "bb-in-r" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
              <div style={{
                width: 190,
                height: 380,
                border: "2.5px solid rgba(255,255,255,0.12)",
                borderRadius: 34,
                background: "#0D0D18",
                padding: "14px 11px",
                boxShadow: "0 0 60px rgba(42,171,238,0.1), 0 40px 60px rgba(0,0,0,0.4)",
                animation: "bb-float 8s 2s ease-in-out infinite",
              }}>
                <div style={{ width: 60, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
                <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-3"
                  style={{ background: "rgba(42,171,238,0.1)", border: "1px solid rgba(42,171,238,0.2)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "rgba(42,171,238,0.3)" }}>⚡</div>
                  <div style={{ color: "#2AABEE", fontSize: 10, fontWeight: 700 }}>Nexus Bot</div>
                </div>
                {[
                  { m: "Amazon pe best laptop under 50k dikhao", self: true },
                  { m: "Top 5 options found! Best pick: Dell i5 @₹47,990 ✓", self: false },
                  { m: "Compare karo HP ke saath", self: true },
                  { m: "Comparison ready 📊", self: false },
                ].map((b, i) => (
                  <div key={i} className="mb-2" style={{ display: "flex", justifyContent: b.self ? "flex-end" : "flex-start" }}>
                    <div style={{
                      background: b.self ? "rgba(42,171,238,0.2)" : "rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "4px 8px",
                      fontSize: 8, color: b.self ? "#93c5fd" : "rgba(255,255,255,0.65)",
                      maxWidth: "82%",
                    }}>{b.m}</div>
                  </div>
                ))}
                <div className="text-center mt-4" style={{ color: "rgba(255,255,255,0.35)", fontSize: 9.5 }}>Telegram</div>
              </div>
            </div>
          </div>

          <div className={`text-center mt-10 text-slate-500 text-sm ${accIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
            WhatsApp · Telegram · Web Platform · Mobile App (coming soon)
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §7  CONNECTORS                                     ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={connRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${connIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7C6BFF" }}>Integrations</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Connect everything.</h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Nexus works with the apps you already use. No switching. No friction.</p>
        </div>

        <div className="space-y-8">
          {CONNECTORS.map(({ group, items }, gi) => (
            <div key={group}>
              <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">{group}</div>
              <div className="flex flex-wrap gap-3">
                {items.map(({ n, Icon, c }, ii) => (
                  <div
                    key={n}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 cursor-default"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      animation: connIn ? `bb-conn 0.5s ${gi * 0.06 + ii * 0.07}s ease both` : "none",
                      opacity: connIn ? 1 : 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px ${c}30`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c}18` }}>
                      <Icon style={{ width: 14, height: 14, color: c }} />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-10 text-center ${connIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.6s" }}>
          <span className="text-slate-500 text-sm">+ 50 more integrations</span>
          <span className="ml-2 text-xs px-3 py-1 rounded-full" style={{ background: "rgba(124,107,255,0.1)", color: "#a78bfa", border: "1px solid rgba(124,107,255,0.25)" }}>
            Vote for next connector →
          </span>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §8  CREATE YOUR OWN AGENT                          ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={createRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${createIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7C6BFF" }}>Build & earn</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Build your AI.<br /><span className="bb-grad">Earn from it.</span></h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Create a custom AI agent for any niche. Publish to the marketplace. Earn 30% every time someone subscribes.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form side */}
          <div className={`rounded-3xl p-8 ${createIn ? "bb-in-l" : "opacity-0"}`}
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", animationDelay: "0.15s" }}>
            <div className="bb-outfit font-bold text-white text-xl mb-6">Configure your agent</div>
            <div className="space-y-4">
              {[
                { label: "Agent name", val: agentName, set: setAgentName, ph: "e.g. ShopBot, LegalHelper" },
                { label: "Role / expertise", val: agentRole, set: setAgentRole, ph: "e.g. E-Commerce AI for Meesho" },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5">{label}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    value={val} onChange={e => { set(e.target.value); setPublished(false); }}
                    placeholder={ph}
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5">Instructions</label>
                <textarea rows={3} className="w-full px-4 py-3 rounded-xl text-slate-300 text-sm resize-none focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  defaultValue="Help users find deals on Meesho and Amazon. Explain in simple Hindi when asked." />
              </div>
              {/* Public/Private toggle */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <div className="text-white text-sm font-medium">Publish to marketplace</div>
                  <div className="text-slate-500 text-xs">Earn 30% per subscriber</div>
                </div>
                <div className="relative w-10 h-6 rounded-full cursor-pointer" style={{ background: "rgba(124,107,255,0.8)" }}>
                  <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
              <button
                onClick={() => setPublished(true)}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #7C6BFF, #5040CC)", boxShadow: "0 0 30px rgba(124,107,255,0.35)" }}
              >
                Publish Agent →
              </button>
            </div>
          </div>

          {/* Earnings side */}
          <div className={`rounded-3xl p-8 flex flex-col gap-6 ${createIn ? "bb-in-r" : "opacity-0"}`}
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", animationDelay: "0.25s" }}>

            {/* Agent card preview */}
            <div>
              <div className="text-slate-500 text-xs uppercase tracking-widest mb-3">Your agent</div>
              <div className="rounded-2xl p-5 transition-all duration-700"
                style={{
                  background: published ? "rgba(124,107,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: published ? "1px solid rgba(124,107,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: published ? "0 0 40px rgba(124,107,255,0.18)" : "none",
                  animation: published ? "bb-pop 0.5s ease" : "none",
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "rgba(124,107,255,0.15)" }}>🤖</div>
                  <div>
                    <div className="text-white font-bold">{agentName || "Your Agent"}</div>
                    <div className="text-violet-300 text-sm">{agentRole || "Custom Role"}</div>
                  </div>
                  {published && <div className="ml-auto text-xs px-2.5 py-1 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/25">Live ✓</div>}
                </div>
              </div>
            </div>

            {/* Earnings counter */}
            <div className="rounded-2xl p-6 flex-1"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Total earnings — marketplace agents</div>
              <div className="bb-outfit font-black text-5xl text-white mb-1">
                ₹{commCount.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                +₹340 this week
              </div>
              <div className="mt-4 space-y-2">
                {["ShopBot by @rahul — 214 subscribers", "StudyAI by @priya — 178 subscribers", "NeetCracker by @amit — 156 subscribers"].map(s => (
                  <div key={s} className="text-xs text-slate-500 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-slate-600 text-xs">You earn 30% of every paid subscription. Forever.</div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §9  STATS                                          ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-20 px-6 max-w-4xl mx-auto" ref={statsRef as React.RefObject<HTMLDivElement>}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { val: c1, suf: "",   label: "AI Agents",          icon: "🤖" },
            { val: c2, suf: "+",  label: "App Connectors",     icon: "🔌" },
            { val: c3, suf: "",   label: "Free msgs / day",    icon: "💬" },
            { val: null, text: "#1 🇮🇳", label: "India First", icon: "🏆" },
          ].map(({ val, suf, label, icon, text }: any, i) => (
            <div
              key={label}
              className={`rounded-2xl p-6 text-center transition-all hover:-translate-y-1 ${statsIn ? "bb-pop" : "opacity-0"}`}
              style={{
                background: "rgba(124,107,255,0.05)",
                border: "1px solid rgba(124,107,255,0.18)",
                boxShadow: "0 0 30px rgba(124,107,255,0.06)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="bb-outfit font-black text-4xl text-white mb-1">
                {text ?? `${val}${suf}`}
              </div>
              <div className="text-slate-400 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  §10  FINAL CTA                                     ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section className="py-36 px-6 relative overflow-hidden" ref={ctaRef as React.RefObject<HTMLDivElement>}>
        {/* Deep space stars */}
        <StarField n={60} />

        {/* Background Nexus orb — large, blurred */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,107,255,0.22) 0%, transparent 70%)",
            animation: "bb-heartbeat 3s ease-in-out infinite" }} />

        <div className={`relative z-10 max-w-3xl mx-auto text-center ${ctaIn ? "bb-in" : "opacity-0"}`}>
          {/* Small orb above */}
          <div className="flex justify-center mb-8">
            <NexusOrb size={80} rings={1} />
          </div>

          <div className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#7C6BFF" }}>Ready?</div>

          <h2 className="bb-outfit font-black text-white leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}>
            Your AI team<br />is waiting.
          </h2>

          <p className="text-slate-400 text-xl mb-4">Nexus handles it.<br /><strong className="text-white">You just live.</strong></p>
          <p className="text-slate-600 text-sm mb-10">Join 500+ users on beta waitlist</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onShowAuth("signup")}
              className="group inline-flex items-center gap-2 px-10 py-5 rounded-full font-bold text-white text-lg transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7C6BFF, #5040CC)", boxShadow: "0 0 70px rgba(124,107,255,0.6)" }}
            >
              Start Free — No credit card
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-600">
            {["50 free messages daily", "WhatsApp native", "No app install needed"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-violet-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="bb-outfit font-black text-xl text-white">
            BotBetter <span className="bb-grad">Nexus</span>
          </div>
          <div className="text-slate-600 text-sm">© 2025 BotBetter. India's first agentic AI platform.</div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map(l => (
              <span key={l} className="text-slate-500 text-sm cursor-pointer hover:text-white transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
