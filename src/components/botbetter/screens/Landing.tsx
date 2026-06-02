import { useRef, useState, useEffect, useMemo } from "react";
import { ScreenKey } from "../TopNav";
import {
  ArrowRight, MessageSquare, Mail, Calendar, Send, Slack,
  CheckCircle2, Zap, GraduationCap, DollarSign, Activity,
  Video, Code2, ShoppingCart, ShoppingBag, TrendingUp, Play,
  FileText, Palette, Camera, Sparkles, ChevronRight,
  CreditCard, Database,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════ *
 *  HOOKS
 * ═══════════════════════════════════════════════════════════ */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold }
    );
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

/* ═══════════════════════════════════════════════════════════ *
 *  STAR FIELD
 * ═══════════════════════════════════════════════════════════ */
const StarField = ({ n = 80 }: { n?: number }) => {
  const stars = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 2.4 + 0.4, d: Math.random() * 13 + 5,
      delay: Math.random() * 9, op: Math.random() * 0.55 + 0.2,
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(p => (
        <div key={p.id} className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s,
            animation: `bb-twinkle ${p.d}s ${p.delay}s ease-in-out infinite`,
            ["--max-op" as string]: p.op }} />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ *
 *  NEXUS ORB  (CSS-only — radial gradient + orbit particles)
 * ═══════════════════════════════════════════════════════════ */
const NexusOrb = ({ size = 160, rings = 2 }: { size?: number; rings?: number }) => {
  const pts = useMemo(() => [
    { r: size * 0.78, dur: 11, del: 0,    sz: 5,   col: "#7C6BFF" },
    { r: size * 0.95, dur: 17, del: -5.5, sz: 3.5, col: "#a78bfa" },
    { r: size * 0.68, dur: 8,  del: -2.2, sz: 4,   col: "#7C6BFF" },
    { r: size * 1.1,  dur: 23, del: -9.1, sz: 3,   col: "#c4b5fd" },
    { r: size * 0.85, dur: 14, del: -3.7, sz: 4.5, col: "#7C6BFF" },
    { r: size * 1.02, dur: 19, del: -7.3, sz: 3,   col: "#a78bfa" },
  ], [size]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2.6, height: size * 2.6 }}>
      {rings >= 1 && (
        <div className="absolute rounded-full"
          style={{ width: size * 1.75, height: size * 1.75, border: "1px solid rgba(124,107,255,0.2)",
            animation: "bb-ring-spin 22s linear infinite" }} />
      )}
      {rings >= 2 && (
        <div className="absolute rounded-full"
          style={{ width: size * 2.15, height: size * 2.15, border: "1px solid rgba(124,107,255,0.12)",
            animation: "bb-ring-spin 36s linear reverse infinite" }} />
      )}
      {/* Extra HUD ring */}
      {rings >= 2 && (
        <div className="absolute rounded-full"
          style={{ width: size * 1.45, height: size * 1.45,
            border: "1px dashed rgba(124,107,255,0.15)",
            animation: "bb-ring-spin 14s linear infinite" }} />
      )}
      {/* Outer glow */}
      <div className="absolute rounded-full" style={{ width: size * 1.6, height: size * 1.6,
        background: "radial-gradient(circle, rgba(124,107,255,0.15) 0%, transparent 70%)" }} />
      <div className="absolute rounded-full" style={{ width: size, height: size,
        background: "radial-gradient(circle, rgba(124,107,255,0.25) 0%, transparent 70%)" }} />
      {/* Orbit particles */}
      {pts.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{ top: "50%", left: "50%",
            marginTop: -(p.sz / 2), marginLeft: -(p.sz / 2),
            width: p.sz, height: p.sz, background: p.col,
            boxShadow: `0 0 ${p.sz * 2.5}px ${p.col}`,
            ["--r" as string]: `${p.r}px`,
            animation: `bb-orbit ${p.dur}s linear ${p.del}s infinite` }} />
      ))}
      {/* Core orb */}
      <div className="relative z-10 rounded-full flex items-center justify-center"
        style={{ width: size, height: size,
          background: "radial-gradient(circle at 32% 28%, #B4ACFF 0%, #7C6BFF 45%, #4C3DBF 78%, #2A1A90 100%)",
          animation: "bb-heartbeat 2.5s ease-in-out infinite",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)" }}>
        {/* HUD tick marks */}
        <div className="absolute inset-2 rounded-full border border-white/10" />
        <span style={{ fontSize: size * 0.28, filter: "drop-shadow(0 0 8px #7C6BFF)" }}>⚡</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ *
 *  HUD PANEL  (Iron-Man JARVIS style panel)
 * ═══════════════════════════════════════════════════════════ */
const HUDPanel = ({
  children, title, color = "#7C6BFF", delay = 0, className = "", scanLine = true,
}: { children: React.ReactNode; title?: string; color?: string; delay?: number; className?: string; scanLine?: boolean }) => (
  <div className={`relative overflow-hidden ${className}`}
    style={{ border: `1px solid ${color}35`, background: "rgba(5,5,15,0.75)",
      backdropFilter: "blur(16px)", borderRadius: 12,
      animation: `bb-hud-appear 0.7s ${delay}s ease both` }}>
    {/* Corner brackets */}
    {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],
      ["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]
    ].map(([pos, bdr], i) => (
      <div key={i} className={`absolute ${pos} w-3.5 h-3.5 ${bdr}`} style={{ borderColor: color }} />
    ))}
    {/* Title bar */}
    {title && (
      <div className="px-4 py-1.5 text-xs font-mono uppercase tracking-widest flex items-center gap-2"
        style={{ color, borderBottom: `1px solid ${color}25`, background: `${color}08` }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color, animation: "bb-dot 1.8s ease-in-out infinite" }} />
        {title}
      </div>
    )}
    {children}
    {/* Horizontal scan line */}
    {scanLine && (
      <div className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
          animation: `bb-scan-h 3.5s linear infinite` }} />
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════ *
 *  CINEMATIC DEMO — animated product "video"
 * ═══════════════════════════════════════════════════════════ */
const DEMO_SEQS = [
  { lang: "HINDI", script: "हिंदी", flag: "🇮🇳",
    input: "Raj ko WhatsApp bhejo,\naaj meeting 4 baje hai",
    steps: ["Parsing intent…", "Language → HINDI ✓", "Target → Raj ✓", "Channel → WhatsApp ✓"],
    agent: "BUDDY", agentEmoji: "🤖", agentColor: "#3B82F6",
    result: ["WhatsApp sent to Raj ✓", "Meeting reminder set 4pm ✓"] },
  { lang: "GUJARATI", script: "ગુજરાતી", flag: "🇮🇳",
    input: "Meesho pe 500 rupiya ni\nt-shirt dikhavo",
    steps: ["Parsing intent…", "Language → GUJARATI ✓", "Platform → Meesho ✓", "Budget → ₹500 ✓"],
    agent: "SELLIO", agentEmoji: "🛒", agentColor: "#F97316",
    result: ["18 t-shirts found ✓", "Best deal: ₹349 sent ✓"] },
  { lang: "BENGALI", script: "বাংলা", flag: "🇮🇳",
    input: "NEET-er jonno 90 diner\nplan toiri koro",
    steps: ["Parsing intent…", "Language → BENGALI ✓", "Exam → NEET ✓", "Duration → 90 days ✓"],
    agent: "CRACKY", agentEmoji: "📚", agentColor: "#F59E0B",
    result: ["Study plan generated ✓", "Sent to WhatsApp ✓"] },
  { lang: "MARATHI", script: "मराठी", flag: "🇮🇳",
    input: "Maze interview prep kara,\ntech round ahe",
    steps: ["Parsing intent…", "Language → MARATHI ✓", "Task → Interview prep ✓", "Round → Technical ✓"],
    agent: "PREPIFY", agentEmoji: "🎤", agentColor: "#22C55E",
    result: ["Mock interview started ✓", "Tech questions ready ✓"] },
  { lang: "URDU", script: "اردو", flag: "🇮🇳",
    input: "Meri Amazon listing\noptimize karo",
    steps: ["Parsing intent…", "Language → URDU ✓", "Platform → Amazon ✓", "Task → Optimize ✓"],
    agent: "SELLIO", agentEmoji: "🛒", agentColor: "#F97316",
    result: ["3 listings improved ✓", "Keywords updated ✓"] },
];

const CinematicDemo = () => {
  const [si, setSi] = useState(0);       // sequence index
  const [phase, setPhase] = useState(0); // 0–5
  const seq = DEMO_SEQS[si];

  useEffect(() => {
    setPhase(0);
    const t = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4200),
      setTimeout(() => setPhase(5), 5600),
      setTimeout(() => { setSi(s => (s + 1) % DEMO_SEQS.length); }, 8200),
    ];
    return () => t.forEach(clearTimeout);
  }, [si]);

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ background: "rgba(4,4,12,0.92)", border: "1px solid rgba(124,107,255,0.3)" }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-violet-900/40"
        style={{ background: "rgba(124,107,255,0.07)" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500/70" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <span className="w-2 h-2 rounded-full bg-green-500/70" />
          <span className="text-xs font-mono text-slate-500 ml-3">NEXUS INTELLIGENCE CORE — LIVE DEMO</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-violet-400" style={{ animation: "bb-dot 1.5s infinite" }}>● ONLINE</span>
          <span className="text-xs font-mono text-slate-600">v2.4.1</span>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-violet-900/30 min-h-[320px]">

        {/* Panel 1 — INPUT */}
        <div className="p-5 relative flex flex-col gap-3">
          <div className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ animation: "bb-dot 2s infinite" }} />
            Input Terminal
          </div>

          {/* Language badge */}
          <div key={`lang-${si}`}
            style={{ animation: "bb-hud-appear 0.4s ease both", background: "rgba(124,107,255,0.15)", border: "1px solid rgba(124,107,255,0.35)" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono w-fit">
            <span>{seq.flag}</span>
            <span className="text-violet-300 font-semibold">{seq.script}</span>
            <span className="text-slate-500">/ {seq.lang}</span>
          </div>

          {/* Typewriter command */}
          {phase >= 1 && (
            <div key={`cmd-${si}`} className="flex-1 rounded-lg p-4 font-mono text-sm"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)", animation: "bb-hud-appear 0.3s ease both" }}>
              <span className="text-slate-500 text-xs">{">"} </span>
              <span className="text-green-300" style={{ animation: `bb-typewriter ${seq.input.length * 0.04}s steps(${seq.input.length}) both` }}>
                {seq.input}
              </span>
              <span className="text-green-400" style={{ animation: "bb-cursor 0.8s step-end infinite" }}>█</span>
            </div>
          )}

          {phase < 1 && (
            <div className="flex-1 rounded-lg p-4" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-slate-600 font-mono text-sm">{">"} <span style={{ animation: "bb-cursor 0.8s step-end infinite" }}>█</span></span>
            </div>
          )}
        </div>

        {/* Panel 2 — NEXUS PROCESSING */}
        <div className="p-5 relative flex flex-col gap-3 items-center justify-start">
          <div className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{ animation: "bb-dot 1.6s infinite" }} />
            Nexus Core
          </div>

          {/* Orb */}
          <div className="flex-shrink-0">
            <div className="relative flex items-center justify-center"
              style={{ width: 90, height: 90 }}>
              <div className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(124,107,255,0.3) 0%, transparent 70%)" }} />
              <div className="absolute rounded-full"
                style={{ width: 90, height: 90, border: "1px solid rgba(124,107,255,0.3)",
                  animation: "bb-ring-spin 8s linear infinite" }} />
              <div className="absolute rounded-full"
                style={{ width: 70, height: 70, border: "1px dashed rgba(124,107,255,0.2)",
                  animation: "bb-ring-spin 5s linear reverse infinite" }} />
              <div className="w-14 h-14 rounded-full flex items-center justify-center z-10"
                style={{ background: "radial-gradient(circle at 35% 30%, #9B8FFF, #7C6BFF 50%, #4C3DBF)",
                  animation: "bb-heartbeat 2s ease-in-out infinite" }}>
                <span className="text-xl">⚡</span>
              </div>
            </div>
          </div>

          {/* Processing steps */}
          <div className="w-full space-y-1.5">
            {seq.steps.map((s, i) => (
              phase >= 2 + Math.floor(i * 0.6) && (
                <div key={`${si}-${i}`} className="flex items-center gap-2 text-xs font-mono"
                  style={{ animation: `bb-slide-l 0.4s ${i * 0.15}s ease both` }}>
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-violet-400" />
                  <span className="text-slate-300">{s}</span>
                </div>
              )
            ))}
            {phase >= 3 && (
              <div key={`agent-${si}`} className="mt-2 pt-2 border-t border-violet-900/40"
                style={{ animation: "bb-hud-appear 0.4s ease both" }}>
                <div className="text-xs font-mono text-slate-500">ROUTING TO:</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base">{seq.agentEmoji}</span>
                  <span className="font-mono font-bold text-sm" style={{ color: seq.agentColor }}>{seq.agent}</span>
                  <span className="text-xs text-slate-500">agent</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3 — OUTPUT */}
        <div className="p-5 relative flex flex-col gap-3">
          <div className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: phase >= 5 ? "#22C55E" : "#4B5563", animation: phase >= 5 ? "bb-dot 1.4s infinite" : "none" }} />
            Output
          </div>

          {phase >= 5 ? (
            <div key={`result-${si}`} className="flex-1 rounded-lg p-4 space-y-2"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)",
                animation: "bb-hud-appear 0.5s ease both" }}>
              <div className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-3">
                ✓ TASK COMPLETE
              </div>
              {seq.result.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono text-emerald-300"
                  style={{ animation: `bb-slide-r 0.4s ${i * 0.2}s ease both` }}>
                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {r}
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-emerald-900/40 text-xs font-mono text-slate-600">
                Delivered via WhatsApp
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-lg p-4 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {phase >= 4 ? (
                <div className="text-center">
                  <div className="text-xs font-mono text-violet-400 mb-2">Executing…</div>
                  <div className="flex gap-1 justify-center">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="w-1.5 h-5 rounded-sm bg-violet-500"
                        style={{ animation: `bb-bar-pulse 0.8s ${i * 0.15}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-xs font-mono text-slate-700">Awaiting input…</span>
              )}
            </div>
          )}

          {/* Sequence dots */}
          <div className="flex justify-center gap-1.5 pt-1">
            {DEMO_SEQS.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{ width: i === si ? 16 : 6, height: 6,
                  background: i === si ? "#7C6BFF" : "rgba(124,107,255,0.2)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom scan line */}
      <div className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,107,255,0.6), transparent)",
          animation: "bb-scan-h 4s linear infinite" }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ *
 *  LANGUAGE SHOWCASE
 * ═══════════════════════════════════════════════════════════ */
const LANGUAGES = [
  { name: "Hindi",    native: "हिंदी",    cmd: "Raj ko message bhejo,\naaj 4 baje meeting hai",       color: "#FF6B35", flag: "🇮🇳" },
  { name: "English",  native: "English",   cmd: "Send a WhatsApp to Raj,\nmeeting today at 4pm",        color: "#7C6BFF", flag: "🌐" },
  { name: "Marathi",  native: "मराठी",    cmd: "Raj la message pathva,\naaj 4 la meeting aahe",        color: "#00D4AA", flag: "🇮🇳" },
  { name: "Gujarati", native: "ગુજરાતી",  cmd: "Raj ne message moklo,\naaj 4 vage meeting che",        color: "#FFB800", flag: "🇮🇳" },
  { name: "Bengali",  native: "বাংলা",    cmd: "Raj ke message pathao,\naaj 4tar meeting ache",        color: "#FF4D9E", flag: "🇮🇳" },
  { name: "Kannada",  native: "ಕನ್ನಡ",   cmd: "Raj ge message kalisi,\nievu 4 gante meeting ide",     color: "#4DFFB4", flag: "🇮🇳" },
  { name: "Urdu",     native: "اردو",     cmd: "Raj ko paigham bhejo,\naaj 4 baje meeting hai",        color: "#FF8C42", flag: "🇮🇳", rtl: true },
  { name: "Tamil",    native: "தமிழ்",   cmd: "Raj-ku message anuppu,\nindru 4 mani meeting irukku",  color: "#9B59B6", flag: "🇮🇳" },
];

const LanguageShowcase = ({ inView }: { inView: boolean }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive(a => (a + 1) % LANGUAGES.length), 2600);
    return () => clearInterval(id);
  }, [paused]);

  // Position each language node radially around center
  const nodePositions = useMemo(() => {
    return LANGUAGES.map((_, i) => {
      const angle = (360 / LANGUAGES.length) * i - 90; // start from top
      const rad = (angle * Math.PI) / 180;
      const rx = 0.42; // relative radius in container units (0-1)
      return { x: 50 + rx * 50 * Math.cos(rad), y: 50 + rx * 50 * Math.sin(rad) };
    });
  }, []);

  return (
    <div className="relative w-full" style={{ paddingBottom: "min(560px, 100vw)" }}>
      {/* Orbiting ring decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute rounded-full border border-dashed border-violet-900/30"
          style={{ width: "84%", height: "84%", animation: "bb-ring-spin 60s linear infinite" }} />
        <div className="absolute rounded-full border border-violet-900/20"
          style={{ width: "68%", height: "68%", animation: "bb-ring-spin 40s linear reverse infinite" }} />
      </div>

      {/* Language nodes */}
      {LANGUAGES.map((lang, i) => {
        const pos = nodePositions[i];
        const isActive = active === i;
        return (
          <div
            key={lang.name}
            className={`absolute cursor-pointer transition-all duration-400 ${inView ? "bb-pop" : "opacity-0"}`}
            style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: `translate(-50%, -50%) ${isActive ? "scale(1.12)" : "scale(1)"}`,
              zIndex: isActive ? 10 : 1,
              animationDelay: `${i * 0.09}s`,
            }}
            onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 8000); }}
          >
            <div
              className="rounded-2xl transition-all duration-400 overflow-hidden"
              style={{
                background: isActive ? `${lang.color}15` : "rgba(255,255,255,0.025)",
                border: `1px solid ${isActive ? lang.color + "60" : "rgba(255,255,255,0.08)"}`,
                boxShadow: isActive ? `0 0 35px ${lang.color}35, 0 0 80px ${lang.color}15` : "none",
                minWidth: isActive ? 210 : 110,
                padding: isActive ? "12px 16px" : "10px 14px",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{lang.flag}</span>
                <span className="font-bold text-sm" style={{ fontFamily: "Outfit, sans-serif", color: isActive ? lang.color : "rgba(255,255,255,0.7)" }}>
                  {lang.native}
                </span>
                {isActive && <span className="text-xs text-slate-500 ml-auto">{lang.name}</span>}
              </div>
              {isActive && (
                <div className="text-xs leading-relaxed mt-2 pt-2 border-t font-mono"
                  style={{ borderColor: `${lang.color}25`, color: "rgba(255,255,255,0.7)",
                    direction: lang.rtl ? "rtl" : "ltr", animation: "bb-fade-up 0.3s ease both" }}>
                  {lang.cmd}
                </div>
              )}
            </div>
            {/* Connection line to center */}
            {isActive && (
              <div className="absolute rounded-full pointer-events-none"
                style={{
                  width: 6, height: 6,
                  background: lang.color,
                  boxShadow: `0 0 10px ${lang.color}`,
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "bb-dot 1.5s ease-in-out infinite",
                }} />
            )}
          </div>
        );
      })}

      {/* Central Nexus Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5">
        <div className={inView ? "bb-scale-enter" : "opacity-0"}>
          <NexusOrb size={80} rings={2} />
        </div>
      </div>

      {/* Active language HUD readout */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
        <div key={active} className="text-center" style={{ animation: "bb-fade-up 0.3s ease both" }}>
          <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">
            {LANGUAGES[active].name} → NEXUS → Agent
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ *
 *  3D AGENT CARD
 * ═══════════════════════════════════════════════════════════ */
const AGENTS = [
  { emoji: "⚡", name: "Nexus",   role: "Master Orchestrator", col: "#7C6BFF",
    caps: ["Routes all commands intelligently", "Runs tasks in background", "Remembers your preferences"] },
  { emoji: "🤖", name: "Buddy",   role: "Personal Assistant",  col: "#3B82F6",
    caps: ["WhatsApp & Telegram messages", "Schedule & reminders", "Email drafting & replies"] },
  { emoji: "🎤", name: "Prepify", role: "Interview Coach",     col: "#22C55E",
    caps: ["AI mock interviews", "Resume analysis & tips", "Career roadmap in Hindi"] },
  { emoji: "🛒", name: "Sellio",  role: "E-Commerce AI",       col: "#F97316",
    caps: ["Auto-write product listings", "Price & competitor analysis", "Customer reply automation"] },
  { emoji: "🎬", name: "Creato",  role: "Content Creator",     col: "#EC4899",
    caps: ["Reel scripts & video ideas", "Social media captions", "Content calendar planning"] },
  { emoji: "💰", name: "Finio",   role: "Finance Advisor",     col: "#14B8A6",
    caps: ["Budget & expense tracking", "SIP & investment advice", "Tax saving in Hinglish"] },
  { emoji: "📚", name: "Cracky",  role: "Exam Cracker",        col: "#F59E0B",
    caps: ["NEET, JEE, UPSC prep", "Custom study schedules", "Practice tests & MCQs"] },
  { emoji: "💪", name: "FlexAI",  role: "Fitness Coach",       col: "#EF4444",
    caps: ["Indian-diet meal plans", "Personalized workout plans", "Progress tracking & adjustments"] },
];

const AgentCard3D = ({ agent, delay = 0 }: { agent: typeof AGENTS[0]; delay?: number }) => (
  <div className="bb-card-wrap" style={{ height: 268, perspective: 1000, animationDelay: `${delay}ms` }}>
    <div className="bb-card-inner w-full h-full">
      {/* Front */}
      <div className="bb-card-face absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-5"
        style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* HUD corner accents */}
        {[["top-2 left-2","border-t border-l"],["top-2 right-2","border-t border-r"],
          ["bottom-2 left-2","border-b border-l"],["bottom-2 right-2","border-b border-r"]
        ].map(([p, b], i) => (
          <div key={i} className={`absolute ${p} w-3 h-3 ${b}`}
            style={{ borderColor: `${agent.col}40` }} />
        ))}
        <span className="text-5xl"
          style={{ animation: `bb-float ${5.5 + delay * 0.003}s ease-in-out ${delay * 0.002}s infinite`, display: "inline-block",
            filter: `drop-shadow(0 0 12px ${agent.col}70)` }}>
          {agent.emoji}
        </span>
        <div className="text-center">
          <div className="text-white font-bold text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>{agent.name}</div>
          <div className="text-slate-400 text-xs mt-0.5">{agent.role}</div>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: `${agent.col}15`, color: agent.col, border: `1px solid ${agent.col}30` }}>
          Hover to explore →
        </div>
      </div>
      {/* Back */}
      <div className="bb-card-face bb-card-back absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
        style={{ background: `linear-gradient(135deg, ${agent.col}12, rgba(10,10,20,0.97))`,
          border: `1px solid ${agent.col}45`, boxShadow: `0 0 50px ${agent.col}25` }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <div className="text-white font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>{agent.name}</div>
            <div className="text-xs font-semibold" style={{ color: agent.col }}>{agent.role}</div>
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
        <div className="text-center text-xs font-semibold py-2 rounded-xl"
          style={{ background: `${agent.col}18`, color: agent.col }}>
          Part of Nexus Platform →
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════ *
 *  CONNECTORS DATA
 * ═══════════════════════════════════════════════════════════ */
const CONNECTORS = [
  { group: "Communication",  items: [
    { n: "WhatsApp", Icon: MessageSquare, c: "#25D366" },{ n: "Telegram", Icon: Send, c: "#2AABEE" },
    { n: "Gmail",    Icon: Mail,          c: "#EA4335" },{ n: "Slack",    Icon: Slack, c: "#E01E5A" },
  ]},
  { group: "Productivity", items: [
    { n: "Calendar", Icon: Calendar, c: "#4285F4" },{ n: "Notion", Icon: FileText, c: "#ffffff" },{ n: "Drive", Icon: Database, c: "#34A853" },
  ]},
  { group: "Creative", items: [
    { n: "Canva", Icon: Palette, c: "#00C4CC" },{ n: "Figma", Icon: Sparkles, c: "#A259FF" },{ n: "Adobe", Icon: Zap, c: "#FF0000" },
  ]},
  { group: "Business", items: [
    { n: "Razorpay", Icon: CreditCard, c: "#3395FF" },{ n: "Amazon", Icon: ShoppingCart, c: "#FF9900" },
    { n: "Meesho", Icon: ShoppingBag, c: "#B03DE3" },{ n: "Zerodha", Icon: TrendingUp, c: "#387ED1" },
  ]},
  { group: "Social + Dev", items: [
    { n: "Instagram", Icon: Camera, c: "#E1306C" },{ n: "YouTube", Icon: Video, c: "#FF0000" },
    { n: "GitHub", Icon: Code2, c: "#ffffff" },{ n: "REST API", Icon: Activity, c: "#7C6BFF" },
  ]},
];

/* ═══════════════════════════════════════════════════════════ *
 *  MAIN LANDING
 * ═══════════════════════════════════════════════════════════ */
export const Landing = ({
  onNavigate, onShowAuth,
}: { onNavigate: (s: ScreenKey) => void; onShowAuth: (tab: "login" | "signup") => void }) => {

  const [demoRef,   demoIn]   = useInView(0.1);
  const [langRef,   langIn]   = useInView(0.1);
  const [diffRef,   diffIn]   = useInView();
  const [howRef,    howIn]    = useInView();
  const [agRef,     agIn]     = useInView();
  const [agentRef,  agentIn]  = useInView();
  const [accRef,    accIn]    = useInView();
  const [connRef,   connIn]   = useInView();
  const [createRef, createIn] = useInView();
  const [statsRef,  statsIn]  = useInView();
  const [ctaRef,    ctaIn]    = useInView();

  const c1 = useCounter(8, 2000, statsIn);
  const c2 = useCounter(15, 2200, statsIn);
  const c3 = useCounter(50, 1800, statsIn);
  const commCount = useCounter(12840, 3500, createIn);

  const [agentName, setAgentName] = useState("ShopBot");
  const [agentRole, setAgentRole] = useState("E-Commerce Helper");
  const [published, setPublished] = useState(false);

  return (
    <div className="bb-root min-h-screen text-slate-200 overflow-x-hidden" style={{ background: "#0A0A0F" }}>

      {/* ══════════ GLOBAL STYLES ══════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .bb-root { font-family: 'Inter', system-ui, sans-serif; }
        .bb-outfit { font-family: 'Outfit', sans-serif; }
        .bb-mono { font-family: 'JetBrains Mono', monospace; }

        .bb-grad {
          background: linear-gradient(135deg, #7C6BFF 0%, #a78bfa 45%, #38bdf8 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 200% 200%; animation: bb-grad-shift 5s ease infinite;
        }
        @keyframes bb-grad-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        .bb-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Hex overlay (Iron Man style bg) ── */
        .bb-hex-bg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52'%3E%3Cpolygon points='30,2 58,17 58,35 30,50 2,35 2,17' fill='none' stroke='rgba(124,107,255,0.06)' stroke-width='1'/%3E%3C/svg%3E");
          background-size: 60px 52px;
        }

        /* ── Animations ── */
        @keyframes bb-heartbeat {
          0%,100% { box-shadow: 0 0 40px #7C6BFF80,0 0 80px #7C6BFF40,0 0 140px #7C6BFF20; transform: scale(1); }
          50%      { box-shadow: 0 0 75px #7C6BFFC0,0 0 140px #7C6BFF70,0 0 240px #7C6BFF45; transform: scale(1.07); }
        }
        @keyframes bb-twinkle {
          0%,100% { opacity: 0.08; transform: scale(1); }
          50%      { opacity: var(--max-op, 0.6); transform: scale(1.3); }
        }
        @keyframes bb-orbit {
          from { transform: rotate(0deg)   translateX(var(--r,130px)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--r,130px)) rotate(-360deg); }
        }
        @keyframes bb-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bb-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-11px); }
        }
        @keyframes bb-fade-up {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bb-scale-in {
          from { opacity: 0; transform: scale(0.5) translateY(20px); filter: blur(12px); }
          70%  { opacity: 1; transform: scale(1.04); filter: blur(0); }
          to   { transform: scale(1); }
        }
        @keyframes bb-slide-l { from{opacity:0;transform:translateX(-50px)} to{opacity:1;transform:translateX(0)} }
        @keyframes bb-slide-r { from{opacity:0;transform:translateX(50px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes bb-pop     { from{opacity:0;transform:scale(0.65)} to{opacity:1;transform:scale(1)} }
        @keyframes bb-chaos-a { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(1.5deg)} }
        @keyframes bb-chaos-b { 0%,100%{transform:translateY(-5px) rotate(2deg)} 50%{transform:translateY(9px) rotate(-2.5deg)} }
        @keyframes bb-chaos-c { 0%,100%{transform:translateY(3px) rotate(-1.5deg)} 50%{transform:translateY(-11px) rotate(3deg)} }
        @keyframes bb-chaos-d { 0%,100%{transform:translateY(-8px) rotate(2.5deg)} 50%{transform:translateY(5px) rotate(-1deg)} }
        @keyframes bb-conn    { from{opacity:0;transform:scale(0.55) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes bb-dot     { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }

        /* HUD */
        @keyframes bb-hud-appear {
          0%   { opacity: 0; transform: scaleX(0.85) scaleY(0.9); filter: blur(4px); }
          60%  { opacity: 1; filter: blur(0); }
          100% { transform: scaleX(1) scaleY(1); }
        }
        @keyframes bb-scan-h {
          0%   { top: 0;    opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes bb-scan-v {
          0%   { left: 0;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes bb-cursor  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bb-typewriter { from{width:0} to{width:100%} }
        @keyframes bb-bar-pulse {
          0%,100% { transform: scaleY(0.4); opacity: 0.4; }
          50%     { transform: scaleY(1);   opacity: 1; }
        }
        @keyframes bb-reticle {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bb-data-stream {
          from { transform: translateY(100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes bb-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        /* Card 3D */
        .bb-card-wrap { display: block; }
        .bb-card-inner { position: relative; transform-style: preserve-3d; transition: transform 0.65s cubic-bezier(0.23,1,0.32,1); }
        .bb-card-wrap:hover .bb-card-inner { transform: rotateY(180deg); }
        .bb-card-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .bb-card-back { transform: rotateY(180deg); }

        /* Helpers */
        .bb-in        { animation: bb-fade-up 0.7s cubic-bezier(.16,1,.3,1) both; }
        .bb-in-l      { animation: bb-slide-l 0.7s cubic-bezier(.16,1,.3,1) both; }
        .bb-in-r      { animation: bb-slide-r 0.7s cubic-bezier(.16,1,.3,1) both; }
        .bb-pop       { animation: bb-pop 0.6s cubic-bezier(.16,1,.3,1) both; }
        .bb-scale-enter { animation: bb-scale-in 1s cubic-bezier(.16,1,.3,1) both; }

        ::-webkit-scrollbar { width: 5px; background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(124,107,255,0.3); border-radius: 3px; }
      `}</style>

      {/* Fixed hex+grid bg */}
      <div className="fixed inset-0 bb-hex-bg pointer-events-none z-0 opacity-60" />
      <div className="fixed inset-0 bb-grid pointer-events-none z-0"
        style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, black 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, black 100%)" }} />

      {/* ╔═══════════════════════════════════════╗
          ║  §1  HERO                             ║
          ╚═══════════════════════════════════════╝ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ paddingTop: 80 }}>
        <StarField n={110} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 25%, rgba(10,10,15,0.88) 100%)" }} />

        {/* Pulse rings behind orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[1, 1.6, 2.2].map((s, i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width: 300 * s, height: 300 * s,
                top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                border: "1px solid rgba(124,107,255,0.15)",
                animation: `bb-pulse-ring ${3 + i}s ${i * 0.8}s ease-out infinite` }} />
          ))}
        </div>

        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          {/* Orb */}
          <div className="bb-scale-enter">
            <NexusOrb size={170} rings={2} />
          </div>

          {/* HUD status badge */}
          <div className="bb-in inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest mt-0 mb-5"
            style={{ animationDelay: "0.35s", background: "rgba(124,107,255,0.1)",
              border: "1px solid rgba(124,107,255,0.3)", color: "#a78bfa" }}>
            <span className="w-2 h-2 rounded-full bg-violet-400" style={{ animation: "bb-dot 1.6s ease-in-out infinite" }} />
            India's First Agentic AI Platform
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">8 Regional Languages</span>
          </div>

          {/* Headline */}
          <h1 className="bb-in bb-outfit font-black text-white leading-[1.03] tracking-tight mb-5"
            style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)", animationDelay: "0.45s" }}>
            This is <span className="bb-grad">Nexus.</span>
          </h1>

          <p className="bb-in text-slate-300 text-lg sm:text-xl max-w-2xl leading-relaxed mb-3"
            style={{ animationDelay: "0.58s" }}>
            Not just AI. Not just chatbots. <strong className="text-white">An agent that actually acts.</strong>
          </p>

          <p className="bb-in text-slate-500 text-base max-w-xl leading-relaxed mb-10"
            style={{ animationDelay: "0.68s" }}>
            Speak in <span className="text-violet-300">Hindi, Marathi, Gujarati, Bengali, Kannada, Urdu</span> or any Indian language.
            Nexus understands, decides, and executes — while you do something else.
          </p>

          <div className="bb-in flex flex-col sm:flex-row items-center gap-4" style={{ animationDelay: "0.8s" }}>
            <button onClick={() => onShowAuth("signup")}
              className="group inline-flex items-center gap-2 px-9 py-4 rounded-full font-bold text-white text-lg transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7C6BFF, #5040CC)", boxShadow: "0 0 55px rgba(124,107,255,0.5)" }}>
              Experience Nexus
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white hover:bg-white/10 transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Play className="w-4 h-4 text-violet-400" />
              Watch it work
            </button>
          </div>

          {/* Language pills */}
          <div className="bb-in flex flex-wrap items-center justify-center gap-2 mt-8" style={{ animationDelay: "1s" }}>
            {["हिंदी","मराठी","ગુજરાતી","বাংলা","ಕನ್ನಡ","اردو","தமிழ்","English"].map((l, i) => (
              <span key={l} className="text-xs px-3 py-1 rounded-full"
                style={{ background: "rgba(124,107,255,0.08)", border: "1px solid rgba(124,107,255,0.2)",
                  color: "rgba(196,181,253,0.8)", animationDelay: `${1 + i * 0.08}s`,
                  animation: "bb-pop 0.4s ease both" }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
          style={{ animation: "bb-fade-up 1s 1.1s ease both" }}>
          <div className="text-slate-600 text-xs font-mono tracking-widest">SCROLL</div>
          <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom, rgba(124,107,255,0.7), transparent)" }} />
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §2  CINEMATIC DEMO (Product Video)   ║
          ╚═══════════════════════════════════════╝ */}
      <section id="demo-section" className="py-24 px-6 max-w-5xl mx-auto" ref={demoRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-10 ${demoIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// LIVE DEMO</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">
            See it in action.
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Type any command in any Indian language. Watch Nexus think, route, and execute — in real time.
          </p>
        </div>

        <div className={demoIn ? "bb-in" : "opacity-0"} style={{ animationDelay: "0.2s" }}>
          <CinematicDemo />
        </div>

        {/* Sub labels */}
        <div className={`flex flex-wrap justify-center gap-4 mt-8 ${demoIn ? "bb-in" : "opacity-0"}`}
          style={{ animationDelay: "0.35s" }}>
          {[
            ["🧠","Understands intent"],["🌐","Detects language automatically"],
            ["⚡","Routes to right agent"],["📱","Delivers to WhatsApp"],
          ].map(([icon, label]) => (
            <div key={label as string} className="flex items-center gap-2 text-sm text-slate-400">
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §3  LANGUAGE INTELLIGENCE            ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 overflow-hidden" ref={langRef as React.RefObject<HTMLDivElement>}>
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 ${langIn ? "bb-in" : "opacity-0"}`}>
            <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// LANGUAGE INTELLIGENCE</div>
            <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">
              Every Indian language.<br /><span className="bb-grad">One platform.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              It doesn't matter how you say it. Nexus understands Hindi, Marathi, Gujarati, Bengali, Kannada, Urdu, Tamil, and English — naturally.
            </p>
          </div>

          {/* Radial language showcase */}
          <div className="relative max-w-2xl mx-auto" style={{ minHeight: 520 }}>
            <LanguageShowcase inView={langIn} />
          </div>

          {/* HUD stats row */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 ${langIn ? "bb-in" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}>
            {[
              ["8+", "Indian Languages"],["99%", "Language Detection Accuracy"],
              ["<100ms", "Processing Time"],["∞", "Hinglish Support"],
            ].map(([v, l]) => (
              <HUDPanel key={l} color="#7C6BFF" className="text-center py-4 px-3">
                <div className="bb-outfit font-black text-2xl text-white mb-1">{v}</div>
                <div className="text-slate-500 text-xs font-mono">{l}</div>
              </HUDPanel>
            ))}
          </div>

          {/* Sample commands in different languages */}
          <div className={`mt-8 rounded-2xl p-6 ${langIn ? "bb-in" : "opacity-0"}`}
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", animationDelay: "0.5s" }}>
            <div className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-4">Same command. Different languages. Same result.</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { lang: "Hindi", text: "Raj ko message bhejo", col: "#FF6B35" },
                { lang: "Marathi", text: "Raj la message pathva", col: "#00D4AA" },
                { lang: "Gujarati", text: "Raj ne message moklo", col: "#FFB800" },
                { lang: "Bengali", text: "Raj ke message pathao", col: "#FF4D9E" },
              ].map(({ lang, text, col }) => (
                <div key={lang} className="rounded-xl px-4 py-3 font-mono text-sm"
                  style={{ background: `${col}08`, border: `1px solid ${col}25` }}>
                  <div className="text-xs mb-1" style={{ color: col }}>{lang}</div>
                  <div className="text-slate-300">"{text}"</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                <span className="text-violet-400">↓</span>
                All 4 commands route to <strong className="text-white mx-1">Buddy</strong> → WhatsApp sent ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §4  THE DIFFERENCE                   ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-6xl mx-auto" ref={diffRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${diffIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// THE DIFFERENCE</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">
            Stop switching.<br /><span className="bb-grad">Start delegating.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* CHAOS side */}
          <div className={`rounded-3xl p-8 relative overflow-hidden ${diffIn ? "bb-in-l" : "opacity-0"}`}
            style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)", animationDelay: "0.15s" }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20">
              OLD WAY
            </div>
            <div className="relative h-52 mb-6 flex items-center justify-center">
              {[
                { n: "ChatGPT", c: "#10A37F", anim: "bb-chaos-a", del: "0s",   pos: { top: "8%",  left: "5%"  } },
                { n: "Claude",  c: "#D97706", anim: "bb-chaos-b", del: "0.9s", pos: { top: "6%",  right: "8%" } },
                { n: "Gemini",  c: "#4285F4", anim: "bb-chaos-c", del: "1.5s", pos: { bottom: "10%", left: "8%" } },
                { n: "Copilot", c: "#E1306C", anim: "bb-chaos-d", del: "0.5s", pos: { bottom: "8%", right: "5%" } },
              ].map(({ n, c, anim, del, pos }: any) => (
                <div key={n} className="absolute px-4 py-2 rounded-xl text-sm font-bold font-mono"
                  style={{ background: `${c}15`, border: `1px solid ${c}40`, color: c,
                    animation: `${anim} ${5.5 + Math.random() * 2}s ease-in-out ${del} infinite`, filter: "blur(0.2px)", ...pos }}>
                  {n}
                </div>
              ))}
              <div className="rounded-2xl px-5 py-4 text-center z-10"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <div className="text-3xl mb-1">😵</div>
                <div className="text-white font-bold text-sm font-mono">YOU</div>
                <div className="text-red-400 text-xs mt-0.5">doing everything manually</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              {["Switch between 5+ different AI tools","Copy-paste context every single time","No memory — explain yourself again and again","Pay 4 separate monthly subscriptions","Nothing actually executes for you"].map(t => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-red-500 mt-0.5 font-bold">✗</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* ORDER side */}
          <div className={`rounded-3xl p-8 relative overflow-hidden ${diffIn ? "bb-in-r" : "opacity-0"}`}
            style={{ background: "rgba(124,107,255,0.04)", border: "1px solid rgba(124,107,255,0.22)",
              boxShadow: "0 0 60px rgba(124,107,255,0.09)", animationDelay: "0.25s" }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20">
              BOTBETTER WAY
            </div>
            <div className="relative h-52 mb-6 flex items-center justify-center">
              {[
                { label: "Buddy",   col: "#3B82F6", pos: { top: "10%",   left: "15%"  } },
                { label: "Sellio",  col: "#F97316", pos: { top: "10%",   right: "15%" } },
                { label: "Cracky",  col: "#F59E0B", pos: { bottom: "10%",left: "15%"  } },
                { label: "Prepify", col: "#22C55E", pos: { bottom: "10%",right: "15%" } },
              ].map(({ label, col, pos }: any) => (
                <div key={label} className="absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                  style={{ background: `${col}18`, border: `1px solid ${col}45`, color: col,
                    animation: "bb-float 5s ease-in-out infinite", boxShadow: `0 0 18px ${col}25`, ...pos }}>
                  {label[0]}
                </div>
              ))}
              <div className="z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center"
                style={{ background: "radial-gradient(circle at 35% 30%, #9B8FFF, #7C6BFF 50%, #4C3DBF)",
                  boxShadow: "0 0 45px rgba(124,107,255,0.7), 0 0 90px rgba(124,107,255,0.35)",
                  animation: "bb-heartbeat 2.4s ease-in-out infinite" }}>
                <span className="text-2xl">⚡</span>
                <span className="text-white text-[9px] font-bold font-mono mt-0.5">NEXUS</span>
              </div>
            </div>
            <ul className="space-y-2.5">
              {["One command — Nexus routes to the right agent","Remembers you — no context needed twice","Executes tasks while you're away","Single subscription. All 8 agents included","Results delivered to your WhatsApp"].map(t => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §5  HOW IT WORKS                     ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={howRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-12 ${howIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// HOW IT WORKS</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">One command.<br />Everything happens.</h2>
        </div>

        <div className={`${howIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
          <HUDPanel title="NEXUS EXECUTION FLOW" color="#7C6BFF">
            <div className="p-6 space-y-0">
              {[
                { n: "01", icon: "💬", title: "You command — in any language", desc: "Type or speak naturally in Hindi, English, Marathi, Gujarati, Bengali, Kannada, Urdu…" },
                { n: "02", icon: "⚡", title: "Nexus understands intent", desc: "Detects language → parses intent → identifies targets → selects agents — in milliseconds." },
                { n: "03", icon: "🎯", title: "Dispatches to specialist agents", desc: "Routes simultaneously to Buddy, Sellio, Cracky, or whichever agent fits the task." },
                { n: "04", icon: "📱", title: "Result delivered to WhatsApp", desc: "Done. You get notified. No app-switching. Nexus closes the loop." },
              ].map((s, i) => (
                <div key={i}>
                  <div className={`flex items-start gap-5 py-5 ${howIn ? "bb-in" : "opacity-0"}`}
                    style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                    <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono relative"
                      style={{ background: "rgba(124,107,255,0.15)", border: "1px solid rgba(124,107,255,0.4)", color: "#a78bfa" }}>
                      {s.n}
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-full"
                        style={{ border: "1px solid rgba(124,107,255,0.3)", animation: `bb-pulse-ring 2.5s ${i * 0.5}s ease-out infinite` }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{s.icon}</span>
                        <span className="text-white font-semibold">{s.title}</span>
                      </div>
                      <p className="text-slate-500 text-sm">{s.desc}</p>
                    </div>
                  </div>
                  {i < 3 && <div className="ml-4 w-px h-4" style={{ background: "rgba(124,107,255,0.25)" }} />}
                </div>
              ))}
            </div>
          </HUDPanel>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §6  PLATFORM IS AGENTIC              ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={agRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${agIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// CORE DIFFERENTIATOR</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">
            The platform itself<br /><span className="bb-grad">thinks.</span>
          </h2>
        </div>

        <div className={`grid sm:grid-cols-2 gap-6 mb-8 ${agIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
          <HUDPanel title="TRADITIONAL AI TOOL" color="#EF4444">
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
                {["You","→","Prompt Tool","→","Result"].map((t, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg font-mono text-xs ${t === "→" ? "text-slate-600" : "bg-white/5 border border-white/10"}`}>{t}</span>
                ))}
              </div>
              <p className="text-slate-600 text-xs font-mono">You do all the thinking. It just generates text.</p>
            </div>
          </HUDPanel>
          <HUDPanel title="BOTBETTER NEXUS" color="#7C6BFF">
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                {[["You","#c4b5fd","rgba(124,107,255,0.15)"],["→","#6366f1",null],["Nexus thinks","#c4b5fd","rgba(124,107,255,0.15)"],["→","#6366f1",null],["Done ✓","#34d399","rgba(16,185,129,0.1)"]].map(([t, tc, bg], i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg font-mono text-xs"
                    style={{ color: tc, background: bg || "transparent" }}>{t}</span>
                ))}
              </div>
              <p className="text-violet-300/60 text-xs font-mono">Platform decides everything. You just live.</p>
            </div>
          </HUDPanel>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: "🧠", t: "Understands your intent",   d: "No perfect prompts needed. Nexus gets it in any language." },
            { emoji: "🎯", t: "Picks the right agent",     d: "Automatically routes to the specialist that fits the task." },
            { emoji: "⚡", t: "Executes the task",         d: "Doesn't just suggest — actually sends WhatsApp, sets meetings." },
            { emoji: "📱", t: "Reports back to you",       d: "Sends results to your WhatsApp. No app-switching." },
            { emoji: "💾", t: "Remembers preferences",     d: "Knows your language, style, and habits over time." },
            { emoji: "📈", t: "Gets smarter over time",    d: "Learns from every interaction to serve you better." },
          ].map((f, i) => (
            <div key={i} className={`rounded-2xl p-5 transition-all hover:-translate-y-1 ${agIn ? "bb-pop" : "opacity-0"}`}
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: `${0.05 * i + 0.35}s` }}>
              <span className="text-2xl mb-3 block" style={{ filter: "drop-shadow(0 0 8px rgba(124,107,255,0.5))" }}>{f.emoji}</span>
              <div className="text-white font-semibold text-sm mb-1">{f.t}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §7  8 SPECIALIST AGENTS              ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-6xl mx-auto" ref={agentRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 ${agentIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// THE TEAM</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">8 minds.<br />One platform.</h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Each a specialist. All available via one Nexus command. Hover any card to explore.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {AGENTS.map((ag, i) => (
            <div key={ag.name} className={agentIn ? "bb-pop" : "opacity-0"} style={{ animationDelay: `${i * 0.08}s` }}>
              <AgentCard3D agent={ag} delay={i * 80} />
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className={`mt-6 ${agentIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.7s" }}>
          <div className="text-center text-slate-500 text-sm mb-4 font-mono">// + More agents launching monthly</div>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {["LegalAI", "HealthAI", "TravelAI"].map(n => (
              <div key={n} className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                <div className="text-xl opacity-35">🔒</div>
                <div className="text-slate-500 text-xs font-mono">{n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §8  ACCESS ANYWHERE                  ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 overflow-hidden" ref={accRef as React.RefObject<HTMLDivElement>}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-14 ${accIn ? "bb-in" : "opacity-0"}`}>
            <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// ANYWHERE. ANYTIME.</div>
            <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Nexus lives<br />where you live.</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">No app install needed. Just message Nexus on WhatsApp — in your language.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
            {/* Phone — WhatsApp */}
            <div className={`${accIn ? "bb-in-l" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
              <div style={{ width: 210, height: 420, border: "2.5px solid rgba(255,255,255,0.14)", borderRadius: 38,
                  background: "#0D0D18", padding: "16px 12px",
                  boxShadow: "0 0 70px rgba(37,211,102,0.12), 0 50px 80px rgba(0,0,0,0.5)",
                  animation: "bb-float 6s ease-in-out infinite" }}>
                <div style={{ width: 70, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", margin: "0 auto 14px" }} />
                <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-3"
                  style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{ background: "rgba(37,211,102,0.3)" }}>⚡</div>
                  <div>
                    <div style={{ color: "#25D366", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>Nexus</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>online • BotBetter AI</div>
                  </div>
                </div>
                {[
                  { m: "Raj ko WhatsApp bhejo aaj 4 baje meeting hai", self: true },
                  { m: "Hindi detected ✓\nWhatsApp sent to Raj ✓\nMeeting reminder set @ 4pm ✓", self: false },
                  { m: "Ek kaam aur — meri Amazon listing check karo", self: true },
                  { m: "Sellio active — 3 listings need update. Fixing now… ✓", self: false },
                ].map((b, i) => (
                  <div key={i} className="mb-2" style={{ display: "flex", justifyContent: b.self ? "flex-end" : "flex-start" }}>
                    <div style={{ background: b.self ? "rgba(124,107,255,0.25)" : "rgba(255,255,255,0.07)",
                        borderRadius: 10, padding: "5px 9px", fontSize: 8.5,
                        color: b.self ? "#c4b5fd" : "rgba(255,255,255,0.7)",
                        maxWidth: "80%", whiteSpace: "pre-line" }}>{b.m}</div>
                  </div>
                ))}
                <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginTop: 4 }} />
                <div className="text-center mt-3 font-mono" style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>WhatsApp</div>
              </div>
            </div>

            {/* Laptop */}
            <div className={`${accIn ? "bb-in" : "opacity-0"}`}>
              <div style={{ animation: "bb-float 7.5s 1s ease-in-out infinite" }}>
                <div style={{ width: 440, height: 280, border: "2px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px 14px 0 0", background: "#0D0D18", padding: 14,
                    boxShadow: "0 0 80px rgba(124,107,255,0.14)" }}>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex gap-1.5">
                      {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
                    </div>
                    <div style={{ flex: 1, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.05)", paddingLeft: 8, display: "flex", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }}>app.botbetter.in/nexus</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8, height: "calc(100% - 28px)" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 8 }}>
                      {["⚡ Nexus","🤖 Buddy","📚 Cracky","🛒 Sellio"].map((a, i) => (
                        <div key={i} style={{ padding: "5px 6px", borderRadius: 6, marginBottom: 3, fontSize: 9,
                            background: i === 0 ? "rgba(124,107,255,0.2)" : "transparent",
                            color: i === 0 ? "#c4b5fd" : "rgba(255,255,255,0.3)" }}>{a}</div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      {[{ t: "Meri UPSC preparation plan banao", s: true },{ t: "3-month Hindi medium plan ready! Sent to WhatsApp ✓", s: false }].map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.s ? "flex-end" : "flex-start", marginBottom: 4 }}>
                          <div style={{ background: m.s ? "rgba(124,107,255,0.22)" : "rgba(255,255,255,0.06)",
                              borderRadius: 8, padding: "3px 7px", fontSize: 7.5,
                              color: m.s ? "#c4b5fd" : "rgba(255,255,255,0.5)", maxWidth: "85%" }}>{m.t}</div>
                        </div>
                      ))}
                      <div style={{ height: 20, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                  </div>
                </div>
                <div style={{ width: 480, height: 14, background: "rgba(255,255,255,0.06)", borderRadius: "0 0 6px 6px", margin: "0 auto" }} />
                <div style={{ width: 130, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: "0 0 8px 8px", margin: "0 auto" }} />
                <div className="text-center mt-4 font-mono" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Web Platform</div>
              </div>
            </div>

            {/* Tablet */}
            <div className={`hidden lg:block ${accIn ? "bb-in-r" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
              <div style={{ width: 185, height: 370, border: "2.5px solid rgba(255,255,255,0.12)", borderRadius: 34,
                  background: "#0D0D18", padding: "14px 11px",
                  boxShadow: "0 0 60px rgba(42,171,238,0.1), 0 40px 60px rgba(0,0,0,0.4)",
                  animation: "bb-float 8s 2s ease-in-out infinite" }}>
                <div style={{ width: 60, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
                <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-3"
                  style={{ background: "rgba(42,171,238,0.1)", border: "1px solid rgba(42,171,238,0.2)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "rgba(42,171,238,0.3)" }}>⚡</div>
                  <div style={{ color: "#2AABEE", fontSize: 10, fontWeight: 700 }}>Nexus Bot</div>
                </div>
                {[
                  { m: "Meesho pe 500 ki t-shirt dikhao", self: true },
                  { m: "Gujarati detected ✓\n18 t-shirts found! Best: ₹349 ✓", self: false },
                ].map((b, i) => (
                  <div key={i} className="mb-2" style={{ display: "flex", justifyContent: b.self ? "flex-end" : "flex-start" }}>
                    <div style={{ background: b.self ? "rgba(42,171,238,0.2)" : "rgba(255,255,255,0.07)",
                        borderRadius: 10, padding: "4px 8px", fontSize: 8,
                        color: b.self ? "#93c5fd" : "rgba(255,255,255,0.65)",
                        maxWidth: "82%", whiteSpace: "pre-line" }}>{b.m}</div>
                  </div>
                ))}
                <div className="text-center mt-4 font-mono" style={{ color: "rgba(255,255,255,0.35)", fontSize: 9.5 }}>Telegram</div>
              </div>
            </div>
          </div>
          <div className={`text-center mt-10 text-slate-500 text-sm font-mono ${accIn ? "bb-in" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
            WhatsApp · Telegram · Web Platform · Mobile App (coming soon)
          </div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §9  CONNECTORS                       ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={connRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-12 ${connIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// INTEGRATIONS</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Connect everything.</h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Nexus works with the apps you already use. No switching. No friction.</p>
        </div>
        <div className="space-y-7">
          {CONNECTORS.map(({ group, items }, gi) => (
            <div key={group}>
              <div className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-3">{group}</div>
              <div className="flex flex-wrap gap-3">
                {items.map(({ n, Icon, c }, ii) => (
                  <div key={n}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 cursor-default"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                      animation: connIn ? `bb-conn 0.5s ${gi * 0.06 + ii * 0.07}s ease both` : "none",
                      opacity: connIn ? 1 : 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${c}28`; (e.currentTarget as HTMLDivElement).style.borderColor = `${c}30`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}>
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
          <span className="text-slate-500 text-sm font-mono">+ 50 more integrations</span>
          <span className="ml-3 text-xs px-3 py-1 rounded-full font-mono"
            style={{ background: "rgba(124,107,255,0.1)", color: "#a78bfa", border: "1px solid rgba(124,107,255,0.25)" }}>
            vote for next →
          </span>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §10 CREATE YOUR AGENT                ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={createRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-12 ${createIn ? "bb-in" : "opacity-0"}`}>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">// BUILD & EARN</div>
          <h2 className="bb-outfit font-black text-white text-5xl sm:text-6xl mb-4">Build your AI.<br /><span className="bb-grad">Earn from it.</span></h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Create a custom AI agent for any niche. Publish to the marketplace. Earn 30% forever.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className={`${createIn ? "bb-in-l" : "opacity-0"}`} style={{ animationDelay: "0.15s" }}>
            <HUDPanel title="AGENT BUILDER" color="#7C6BFF">
              <div className="p-6 space-y-4">
                {[["Agent name", agentName, setAgentName, "e.g. ShopBot, LegalHelper"],
                  ["Role / expertise", agentRole, setAgentRole, "e.g. E-Commerce AI"]].map(([label, val, set, ph]: any) => (
                  <div key={label}>
                    <label className="text-slate-500 text-xs uppercase tracking-wider font-mono block mb-1.5">{label}</label>
                    <input className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none font-mono"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      value={val} onChange={e => { set(e.target.value); setPublished(false); }} placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider font-mono block mb-1.5">Instructions</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl text-slate-300 text-sm resize-none focus:outline-none font-mono"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    defaultValue="Help users find deals on Meesho and Amazon in Hindi and Gujarati." />
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div className="text-white text-sm font-semibold">Publish to marketplace</div>
                    <div className="text-slate-500 text-xs font-mono">Earn 30% per subscriber</div>
                  </div>
                  <div className="relative w-10 h-6 rounded-full cursor-pointer" style={{ background: "rgba(124,107,255,0.8)" }}>
                    <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
                  </div>
                </div>
                <button onClick={() => setPublished(true)}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-transform hover:scale-[1.02] font-mono"
                  style={{ background: "linear-gradient(135deg, #7C6BFF, #5040CC)", boxShadow: "0 0 30px rgba(124,107,255,0.35)" }}>
                  PUBLISH AGENT →
                </button>
              </div>
            </HUDPanel>
          </div>

          <div className={`flex flex-col gap-5 ${createIn ? "bb-in-r" : "opacity-0"}`} style={{ animationDelay: "0.25s" }}>
            <HUDPanel title="AGENT PREVIEW" color={published ? "#22C55E" : "#7C6BFF"}>
              <div className="p-5">
                <div className="rounded-xl p-5 transition-all duration-700"
                  style={{ background: published ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${published ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: published ? "0 0 40px rgba(16,185,129,0.15)" : "none",
                    animation: published ? "bb-hud-appear 0.5s ease" : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: "rgba(124,107,255,0.15)" }}>🤖</div>
                    <div>
                      <div className="text-white font-bold font-mono">{agentName || "Your Agent"}</div>
                      <div className="text-violet-300 text-sm font-mono">{agentRole || "Custom Role"}</div>
                    </div>
                    {published && <div className="ml-auto text-xs px-2.5 py-1 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 font-mono">LIVE ✓</div>}
                  </div>
                </div>
              </div>
            </HUDPanel>

            <HUDPanel title="EARNINGS TRACKER" color="#22C55E">
              <div className="p-5">
                <div className="text-slate-500 text-xs font-mono mb-1">Total earnings — marketplace</div>
                <div className="bb-outfit font-black text-4xl text-white mb-1">₹{commCount.toLocaleString("en-IN")}</div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> +₹340 this week
                </div>
                <div className="mt-4 space-y-1.5">
                  {["ShopBot @rahul — 214 subscribers","StudyAI @priya — 178 subscribers","NeetCracker @amit — 156 subscribers"].map(s => (
                    <div key={s} className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{s}
                    </div>
                  ))}
                </div>
              </div>
            </HUDPanel>
          </div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §11 STATS                            ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-20 px-6 max-w-4xl mx-auto" ref={statsRef as React.RefObject<HTMLDivElement>}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { val: c1, suf: "",  label: "AI Agents",       icon: "🤖" },
            { val: c2, suf: "+", label: "App Connectors",  icon: "🔌" },
            { val: c3, suf: "",  label: "Free msgs/day",   icon: "💬" },
            { val: null, text: "#1 🇮🇳", label: "India First", icon: "🏆" },
          ].map(({ val, suf, label, icon, text }: any, i) => (
            <div key={label} className={`${statsIn ? "bb-pop" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <HUDPanel color="#7C6BFF">
                <div className="p-5 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="bb-outfit font-black text-4xl text-white mb-1">{text ?? `${val}${suf}`}</div>
                  <div className="text-slate-400 text-xs font-mono">{label}</div>
                </div>
              </HUDPanel>
            </div>
          ))}
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║  §12 FINAL CTA                        ║
          ╚═══════════════════════════════════════╝ */}
      <section className="py-36 px-6 relative overflow-hidden" ref={ctaRef as React.RefObject<HTMLDivElement>}>
        <StarField n={55} />
        {/* Large pulsing orb */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,107,255,0.2) 0%, transparent 68%)",
            animation: "bb-heartbeat 3s ease-in-out infinite" }} />
        {/* Pulse rings */}
        {[1, 1.5, 2].map((s, i) => (
          <div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ width: 400 * s, height: 400 * s, border: "1px solid rgba(124,107,255,0.12)",
              animation: `bb-pulse-ring ${4 + i * 1.5}s ${i * 1.2}s ease-out infinite` }} />
        ))}

        <div className={`relative z-10 max-w-3xl mx-auto text-center ${ctaIn ? "bb-in" : "opacity-0"}`}>
          <div className="flex justify-center mb-8">
            <NexusOrb size={85} rings={2} />
          </div>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-5">// READY TO BEGIN?</div>
          <h2 className="bb-outfit font-black text-white leading-[1.04] mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}>
            Your AI team<br />is waiting.
          </h2>
          <p className="text-slate-400 text-xl mb-2">Nexus handles it.</p>
          <p className="text-white text-2xl font-bold bb-outfit mb-10">You just live.</p>

          <button onClick={() => onShowAuth("signup")}
            className="group inline-flex items-center gap-2 px-10 py-5 rounded-full font-bold text-white text-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7C6BFF, #5040CC)", boxShadow: "0 0 70px rgba(124,107,255,0.6)" }}>
            Start Free — No credit card
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="text-slate-600 text-sm mt-4 font-mono">Join 500+ users on beta waitlist</p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-slate-600">
            {["50 free messages daily","WhatsApp native","8 regional languages","No app install"].map(t => (
              <span key={t} className="flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3 h-3 text-violet-500" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="bb-outfit font-black text-xl text-white">BotBetter <span className="bb-grad">Nexus</span></div>
          <div className="text-slate-600 text-sm font-mono">© 2025 BotBetter. India's first agentic AI platform.</div>
          <div className="flex gap-6">
            {["Privacy","Terms","Contact"].map(l => (
              <span key={l} className="text-slate-500 text-sm cursor-pointer hover:text-white transition-colors font-mono">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
