import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScreenKey } from "../TopNav";
import {
  ArrowRight, MessageSquare, Mail, Calendar, Send, Slack,
  CheckCircle2, Zap, Sparkles, GraduationCap, Briefcase,
  DollarSign, Activity, Video, PlusCircle, Bell, Code2,
  ShoppingCart, ShoppingBag, ChevronRight, Globe, Smartphone,
  TrendingUp, Users, Play,
} from "lucide-react";

// ── Scroll-visibility hook ───────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

// ── Animated counter hook ───────────────────────────────────
function useCounter(target: number, duration = 2200, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

// ── Three.js Neural Brain ────────────────────────────────────
const NeuralBrain = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef  = useRef<THREE.Mesh>(null);
  const haloRef  = useRef<THREE.Mesh>(null);

  const { nodePos, linePos, outerPos } = useMemo(() => {
    const N = 110;
    const nodePos = new Float32Array(N * 3);
    const vecs: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 2 - 1);
      const r = 0.5 + Math.random() * 1.75;
      const x = r * Math.sin(p) * Math.cos(t) * 1.35;
      const y = r * Math.sin(p) * Math.sin(t) * 0.88;
      const z = r * Math.cos(p);
      nodePos[i * 3] = x; nodePos[i * 3 + 1] = y; nodePos[i * 3 + 2] = z;
      vecs.push(new THREE.Vector3(x, y, z));
    }
    const lv: number[] = [];
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++)
        if (vecs[i].distanceTo(vecs[j]) < 0.92)
          lv.push(vecs[i].x, vecs[i].y, vecs[i].z, vecs[j].x, vecs[j].y, vecs[j].z);
    const linePos = new Float32Array(lv);

    const outerPos = new Float32Array(280 * 3);
    for (let i = 0; i < 280; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 2 - 1);
      const r = 2.9 + Math.random() * 2.4;
      outerPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      outerPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      outerPos[i * 3 + 2] = r * Math.cos(p);
    }
    return { nodePos, linePos, outerPos };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.09;
      groupRef.current.rotation.x = Math.sin(t * 0.32) * 0.07;
    }
    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 2.5 + Math.sin(t * 2.4) * 1.6;
      const s = 1 + Math.sin(t * 1.9) * 0.13;
      coreRef.current.scale.setScalar(s);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 0.25;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={nodePos.length / 3} array={nodePos} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.066} color="#9B8FFF" transparent opacity={0.95} sizeAttenuation depthWrite={false} />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={linePos.length / 3} array={linePos} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#7C6BFF" transparent opacity={0.17} />
        </lineSegments>
      </group>

      {/* Pulsing core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color="#7C6BFF" emissive="#7C6BFF" emissiveIntensity={3} />
      </mesh>

      {/* Spinning halo ring */}
      <mesh ref={haloRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1.85, 0.025, 16, 120]} />
        <meshStandardMaterial color="#7C6BFF" emissive="#7C6BFF" emissiveIntensity={1} transparent opacity={0.45} />
      </mesh>

      {/* Outer floating particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={outerPos.length / 3} array={outerPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.017} color="#7C6BFF" transparent opacity={0.32} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
};

// ── Agent data ───────────────────────────────────────────────
const AGENTS = [
  { emoji: "🧠", name: "Nexus",   role: "Master Orchestrator", color: "#7C6BFF", desc: "Routes every command, coordinates all agents, executes multi-step tasks autonomously.", caps: ["Natural language routing", "Multi-agent coordination", "Background task execution"] },
  { emoji: "💬", name: "Buddy",   role: "Personal Assistant",  color: "#25D366", desc: "Your WhatsApp-native AI for daily communication and task management.", caps: ["Send WhatsApp & Telegram", "Calendar & reminders", "Draft emails & replies"] },
  { emoji: "🎯", name: "Prepify", role: "Career Coach",        color: "#4285F4", desc: "AI interview coach and career mentor in Hindi & English.", caps: ["Mock interviews + feedback", "Resume review", "Career roadmaps"] },
  { emoji: "🛒", name: "Sellio",  role: "E-Commerce Agent",    color: "#FF9900", desc: "Automates your Meesho / Amazon selling workflow end-to-end.", caps: ["Auto-write listings", "Price & competitor analysis", "Customer reply automation"] },
  { emoji: "🎨", name: "Creato",  role: "Content Creator",     color: "#E1306C", desc: "Creates viral content ideas, scripts, and captions across all platforms.", caps: ["Reel scripts & ideas", "Social media captions", "Content calendar"] },
  { emoji: "💰", name: "Finio",   role: "Finance Advisor",     color: "#10B981", desc: "Smart money management and investment guidance in simple Hinglish.", caps: ["Budget planning", "SIP & investment advice", "Tax saving tips"] },
  { emoji: "📚", name: "Cracky",  role: "Study Partner",       color: "#F59E0B", desc: "Cracks competitive exams with personalized study plans and mock tests.", caps: ["NEET, JEE, UPSC prep", "Practice tests & quizzes", "Concept breakdowns"] },
  { emoji: "💪", name: "FlexAI",  role: "Fitness Coach",       color: "#EF4444", desc: "Builds custom workout and diet plans based on Indian lifestyle.", caps: ["Personalized workout plans", "Indian diet planning", "Progress tracking"] },
];

const FLOW_EXAMPLES = [
  { cmd: '"Send WhatsApp to Raj"',        nexus: "Understands intent",     agent: "Buddy",   result: "WhatsApp sent ✓",           color: "#25D366" },
  { cmd: '"Show tshirts under ₹200"',     nexus: "Routes to shopping",     agent: "Sellio",  result: "Results shown ✓",           color: "#FF9900" },
  { cmd: '"Prepare me for interview"',    nexus: "Routes to career",       agent: "Prepify", result: "Mock interview starts ✓",   color: "#4285F4" },
];

const CONNECTORS = [
  { name: "WhatsApp",        Icon: MessageSquare, color: "#25D366" },
  { name: "Gmail",           Icon: Mail,          color: "#EA4335" },
  { name: "Telegram",        Icon: Send,          color: "#2AABEE" },
  { name: "Google Calendar", Icon: Calendar,      color: "#4285F4" },
  { name: "Slack",           Icon: Slack,         color: "#E01E5A" },
  { name: "Instagram",       Icon: Video,         color: "#E1306C" },
  { name: "Amazon",          Icon: ShoppingCart,  color: "#FF9900" },
  { name: "Meesho",          Icon: ShoppingBag,   color: "#B03DE3" },
  { name: "Zerodha",         Icon: TrendingUp,    color: "#387ED1" },
  { name: "Canva",           Icon: Sparkles,      color: "#00C4CC" },
];

// ── 3D Flip Agent Card ───────────────────────────────────────
const AgentCard = ({ agent, delay }: { agent: typeof AGENTS[0]; delay: number }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative cursor-pointer"
      style={{ height: 270, perspective: 1000 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          animationDelay: `${delay}ms`,
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-6"
          style={{
            backfaceVisibility: "hidden",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: flipped ? `0 0 0 1px ${agent.color}40, 0 0 40px ${agent.color}25` : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          <span
            className="text-5xl"
            style={{
              animation: `agent-float 4s ease-in-out ${delay * 0.2}ms infinite`,
              display: "inline-block",
            }}
          >
            {agent.emoji}
          </span>
          <div className="text-center">
            <div className="text-white font-bold text-lg font-outfit">{agent.name}</div>
            <div className="text-slate-400 text-xs mt-0.5">{agent.role}</div>
          </div>
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full mt-1"
            style={{ background: `${agent.color}18`, color: agent.color, border: `1px solid ${agent.color}35` }}
          >
            Hover to explore
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(135deg, ${agent.color}14, rgba(10,10,15,0.97))`,
            border: `1px solid ${agent.color}45`,
            boxShadow: `0 0 50px ${agent.color}30`,
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <div className="text-white font-bold font-outfit">{agent.name}</div>
                <div className="text-xs font-medium" style={{ color: agent.color }}>{agent.role}</div>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">{agent.desc}</p>
          </div>
          <ul className="space-y-1.5 mt-3">
            {agent.caps.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: agent.color }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ── Stat card ────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, text, active }: { value?: number; suffix?: string; label: string; text?: string; active: boolean }) => {
  const count = useCounter(value ?? 0, 2000, active);
  return (
    <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(124,107,255,0.05)", border: "1px solid rgba(124,107,255,0.2)", boxShadow: "0 0 30px rgba(124,107,255,0.08)" }}>
      <div className="font-outfit font-black text-5xl text-white mb-2">
        {text ? text : `${count}${suffix ?? ""}`}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN LANDING COMPONENT
// ════════════════════════════════════════════════════════════
export const Landing = ({
  onNavigate,
  onShowAuth,
}: {
  onNavigate: (s: ScreenKey) => void;
  onShowAuth: (tab: "login" | "signup") => void;
}) => {
  // section refs for scroll animations
  const [howRef, howInView]       = useInView();
  const [agentsRef, agentsInView] = useInView();
  const [devRef, devInView]       = useInView();
  const [connRef, connInView]     = useInView();
  const [createRef, createInView] = useInView();
  const [statsRef, statsInView]   = useInView();
  const [ctaRef, ctaInView]       = useInView();

  // Create-agent preview state
  const [agentName, setAgentName]   = useState("Shopify Helper");
  const [agentRole, setAgentRole]   = useState("E-Commerce Bot");
  const [showPreview, setShowPreview] = useState(false);
  const commissionCount = useCounter(2847, 3000, createInView);

  // active flow example index
  const [flowIdx, setFlowIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFlowIdx(i => (i + 1) % FLOW_EXAMPLES.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="min-h-screen text-slate-200 overflow-x-hidden selection:bg-violet-500/30 selection:text-white"
      style={{ background: "#0A0A0F", fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        .font-outfit { font-family: 'Outfit', sans-serif; }

        .text-gradient {
          background: linear-gradient(135deg, #7C6BFF 0%, #a78bfa 40%, #38bdf8 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 200% 200%; animation: grad 6s ease infinite;
        }

        @keyframes grad { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        @keyframes agent-float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-10px); }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-left {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-right {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes flow-arrow {
          0%   { opacity: 0.2; transform: scaleX(0.5) translateX(-10px); }
          50%  { opacity: 1;   transform: scaleX(1.0) translateX(0px); }
          100% { opacity: 0.2; transform: scaleX(0.5) translateX(10px); }
        }

        @keyframes orb-pulse {
          0%,100% { transform: scale(1);    opacity: 0.7; }
          50%     { transform: scale(1.12); opacity: 1; }
        }

        @keyframes connector-in {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0px) scale(1); }
        }

        .in-view-fade-up   { animation: fade-up 0.7s cubic-bezier(.16,1,.3,1) both; }
        .in-view-slide-l   { animation: slide-left  0.7s cubic-bezier(.16,1,.3,1) both; }
        .in-view-slide-r   { animation: slide-right 0.7s cubic-bezier(.16,1,.3,1) both; }
        .in-view-pop       { animation: pop-in 0.6s cubic-bezier(.16,1,.3,1) both; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        .card-glass {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(12px);
          border-radius: 20px;
        }

        .glow-purple { box-shadow: 0 0 60px rgba(124,107,255,0.18); }

        .flow-arrow { animation: flow-arrow 1.4s ease-in-out infinite; }
        .orb-pulse  { animation: orb-pulse 2.5s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 6px; background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(124,107,255,0.3); border-radius: 3px; }
      `}</style>

      {/* ── Fixed grid overlay ─────────────────────── */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, black 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, black 100%)" }} />

      {/* ══════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ paddingTop: 80 }}>
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div style={{ position: "absolute", left: "50%", top: "45%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,107,255,0.22) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", left: "30%", top: "60%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", left: "70%", top: "35%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(225,48,108,0.07) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
        </div>

        {/* Three.js canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 8.5], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 4]} intensity={3} color="#7C6BFF" />
            <pointLight position={[4, 2, -2]} intensity={1.5} color="#38bdf8" />
            <NeuralBrain />
          </Canvas>
        </div>

        {/* Floating icon bubbles */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          {[
            { Icon: MessageSquare, color: "#25D366", top: "22%", left: "9%",  delay: "0s" },
            { Icon: Mail,          color: "#EA4335", top: "68%", left: "12%", delay: "1.3s" },
            { Icon: Slack,         color: "#E01E5A", top: "18%", right: "8%", delay: "0.7s" },
            { Icon: Calendar,      color: "#4285F4", top: "72%", right: "11%",delay: "2s" },
            { Icon: Send,          color: "#2AABEE", top: "45%", left: "5%",  delay: "1.8s" },
            { Icon: Zap,           color: "#F59E0B", top: "40%", right: "5%", delay: "0.4s" },
          ].map(({ Icon, color, top, left, right, delay }, i) => (
            <div
              key={i}
              className="absolute p-4 rounded-full"
              style={{
                top, left, right,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(12px)",
                animation: `agent-float ${5 + i * 0.6}s ease-in-out ${delay} infinite`,
                boxShadow: `0 0 20px ${color}30`,
              }}
            >
              <Icon style={{ width: 26, height: 26, color }} />
            </div>
          ))}
        </div>

        {/* Hero text */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.3)", color: "#a78bfa", animation: "fade-up 0.6s ease both" }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C6BFF", animation: "orb-pulse 2s infinite", display: "inline-block" }} />
            India's First Agentic AI Platform
          </div>

          <h1
            className="font-outfit font-black text-white leading-[1.04] tracking-tight mb-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", animation: "fade-up 0.7s 0.1s ease both" }}
          >
            Meet Nexus.
            <br />
            <span className="text-gradient">One command.</span>
            <br />
            Infinite actions.
          </h1>

          <p
            className="text-slate-400 max-w-2xl leading-relaxed mb-10 text-lg"
            style={{ animation: "fade-up 0.7s 0.2s ease both" }}
          >
            Nexus is your master AI — it understands what you want and routes it to the right specialist agent. WhatsApp, Gmail, shopping, studying, finance — all in one command.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-4"
            style={{ animation: "fade-up 0.7s 0.35s ease both" }}
          >
            <button
              onClick={() => onShowAuth("signup")}
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7C6BFF, #5b4ddb)", boxShadow: "0 0 40px rgba(124,107,255,0.45)" }}
            >
              Try Nexus Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            >
              <Play className="w-4 h-4" />
              See how it works
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20" style={{ animation: "fade-up 1s 0.8s ease both" }}>
          <div className="text-slate-500 text-xs tracking-widest uppercase">Scroll</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(124,107,255,0.7), transparent)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2 · HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-32 px-6 max-w-6xl mx-auto" ref={howRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-16 ${howInView ? "in-view-fade-up" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#7C6BFF" }}>How it works</div>
          <h2 className="font-outfit font-black text-white text-5xl sm:text-6xl mb-4">One command.<br />Nexus does the rest.</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">You speak. Nexus thinks. Your agents act.</p>
        </div>

        {/* Animated flow diagram */}
        <div className={`card-glass p-8 sm:p-12 glow-purple mb-12 ${howInView ? "in-view-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
          {/* Steps row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 mb-12">
            {[
              { step: "01", label: "You command", desc: "Type or speak naturally" },
              { step: "02", label: "Nexus thinks", desc: "Understands & routes intent" },
              { step: "03", label: "Agent acts", desc: "Specialist executes the task" },
              { step: "04", label: "Result returned", desc: "Done. You get notified." },
            ].map((s, i) => (
              <div key={i} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1">
                {i > 0 && (
                  <div className="hidden md:block w-full h-px flow-arrow mx-2" style={{ background: "linear-gradient(90deg, transparent, #7C6BFF, transparent)", opacity: 0.6 }} />
                )}
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-outfit ${howInView ? "in-view-pop" : "opacity-0"}`}
                  style={{ background: "rgba(124,107,255,0.15)", border: "1px solid rgba(124,107,255,0.4)", color: "#a78bfa", animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  {s.step}
                </div>
                <div className="text-center md:text-center">
                  <div className="text-white font-semibold text-sm">{s.label}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live example */}
          <div className="rounded-xl p-6" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-semibold">Live example</div>
            <div key={flowIdx} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-3" style={{ animation: "fade-up 0.5s ease both" }}>
              {/* User */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-lg">💬</span>
                <span className="text-white font-medium text-sm">{FLOW_EXAMPLES[flowIdx].cmd}</span>
              </div>
              <ChevronRight className="text-slate-600 hidden md:block shrink-0" />
              {/* Nexus */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl shrink-0" style={{ background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.35)" }}>
                <span className="text-lg">🧠</span>
                <div>
                  <div className="text-white font-semibold text-xs">Nexus</div>
                  <div className="text-purple-300 text-xs">{FLOW_EXAMPLES[flowIdx].nexus}</div>
                </div>
              </div>
              <ChevronRight className="text-slate-600 hidden md:block shrink-0" />
              {/* Agent */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl shrink-0"
                style={{ background: `${FLOW_EXAMPLES[flowIdx].color}14`, border: `1px solid ${FLOW_EXAMPLES[flowIdx].color}40` }}
              >
                <Zap className="w-4 h-4" style={{ color: FLOW_EXAMPLES[flowIdx].color }} />
                <div>
                  <div className="text-white font-semibold text-xs">{FLOW_EXAMPLES[flowIdx].agent}</div>
                  <div className="text-xs" style={{ color: FLOW_EXAMPLES[flowIdx].color }}>executing…</div>
                </div>
              </div>
              <ChevronRight className="text-slate-600 hidden md:block shrink-0" />
              {/* Result */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl shrink-0" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.35)" }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium text-sm">{FLOW_EXAMPLES[flowIdx].result}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3 · AGENTS SHOWCASE
      ══════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-6xl mx-auto" ref={agentsRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-16 ${agentsInView ? "in-view-fade-up" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#7C6BFF" }}>Meet the team</div>
          <h2 className="font-outfit font-black text-white text-5xl sm:text-6xl mb-4">8 Specialist Agents.</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Each one an expert. Hover any card to see what it can do.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={agentsInView ? "in-view-pop" : "opacity-0"}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <AgentCard agent={agent} delay={i * 80} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4 · ACCESS ANYWHERE (device mockups)
      ══════════════════════════════════════════════ */}
      <section className="py-24 px-6 overflow-hidden" ref={devRef as React.RefObject<HTMLDivElement>}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${devInView ? "in-view-fade-up" : "opacity-0"}`}>
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#7C6BFF" }}>Anywhere, anytime</div>
            <h2 className="font-outfit font-black text-white text-5xl sm:text-6xl mb-4">Use Nexus anywhere.</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">WhatsApp · Telegram · Web · Mobile · API</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
            {/* Phone mockup */}
            <div className={`${devInView ? "in-view-slide-l" : "opacity-0"}`} style={{ animationDelay: "0.15s" }}>
              <div
                style={{
                  width: 200,
                  height: 400,
                  border: "2.5px solid rgba(255,255,255,0.15)",
                  borderRadius: 36,
                  background: "#0D0D16",
                  padding: "16px 12px",
                  position: "relative",
                  animation: "agent-float 6s ease-in-out infinite",
                  boxShadow: "0 0 60px rgba(37,211,102,0.12), 0 40px 80px rgba(0,0,0,0.5)",
                }}
              >
                {/* Notch */}
                <div style={{ width: 60, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
                {/* WhatsApp header */}
                <div style={{ background: "rgba(37,211,102,0.1)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }} className="flex items-center gap-2">
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(37,211,102,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 12 }}>🧠</span>
                  </div>
                  <div>
                    <div style={{ color: "#25D366", fontSize: 10, fontWeight: 700 }}>Nexus</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>online</div>
                  </div>
                </div>
                {/* Chat bubbles */}
                {[
                  { msg: "Send ₹500 to Raj", self: true },
                  { msg: "Done! Payment sent ✓", self: false },
                  { msg: "Remind me at 5pm", self: true },
                  { msg: "Reminder set! ⏰", self: false },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: b.self ? "flex-end" : "flex-start", marginBottom: 5 }}>
                    <div style={{
                      background: b.self ? "rgba(124,107,255,0.25)" : "rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "5px 8px",
                      fontSize: 9, color: b.self ? "#c4b5fd" : "rgba(255,255,255,0.7)",
                      maxWidth: "75%",
                    }}>{b.msg}</div>
                  </div>
                ))}
                {/* Label */}
                <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" }}>WhatsApp / Telegram</div>
                </div>
              </div>
            </div>

            {/* Laptop mockup */}
            <div className={`${devInView ? "in-view-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.05s" }}>
              <div style={{ animation: "agent-float 7s 1s ease-in-out infinite" }}>
                {/* Screen */}
                <div style={{
                  width: 420,
                  height: 270,
                  border: "2px solid rgba(255,255,255,0.13)",
                  borderRadius: "14px 14px 0 0",
                  background: "#0D0D16",
                  padding: 14,
                  boxShadow: "0 0 80px rgba(124,107,255,0.15)",
                }}>
                  {/* Browser bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                      <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    ))}
                    <div style={{ flex: 1, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>app.botbetter.in</span>
                    </div>
                  </div>
                  {/* Dashboard content */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, height: "calc(100% - 28px)" }}>
                    {/* Sidebar */}
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 8 }}>
                      {["🧠 Nexus","💬 Buddy","📚 Cracky","🎯 Prepify"].map((a, i) => (
                        <div key={i} style={{ padding: "5px 6px", borderRadius: 6, marginBottom: 3, background: i === 0 ? "rgba(124,107,255,0.2)" : "transparent", color: i === 0 ? "#c4b5fd" : "rgba(255,255,255,0.35)", fontSize: 9 }}>{a}</div>
                      ))}
                    </div>
                    {/* Chat area */}
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      {[
                        { t: "Summarise my emails from today", s: true },
                        { t: "Found 3 important emails. Showing summary…", s: false },
                      ].map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.s ? "flex-end" : "flex-start", marginBottom: 5 }}>
                          <div style={{ background: m.s ? "rgba(124,107,255,0.25)" : "rgba(255,255,255,0.06)", borderRadius: 8, padding: "4px 7px", fontSize: 8, color: m.s ? "#c4b5fd" : "rgba(255,255,255,0.55)", maxWidth: "80%" }}>{m.t}</div>
                        </div>
                      ))}
                      <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                    </div>
                  </div>
                </div>
                {/* Base */}
                <div style={{ width: 460, height: 14, background: "rgba(255,255,255,0.07)", borderRadius: "0 0 6px 6px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: "0 0 8px 8px", margin: "0 auto" }} />
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center", marginTop: 16 }}>Web Platform</div>
              </div>
            </div>

            {/* Tablet mockup */}
            <div className={`hidden lg:block ${devInView ? "in-view-slide-r" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
              <div style={{
                width: 180,
                height: 240,
                border: "2.5px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                background: "#0D0D16",
                padding: 12,
                animation: "agent-float 8s 2s ease-in-out infinite",
                boxShadow: "0 0 50px rgba(66,133,244,0.12), 0 40px 60px rgba(0,0,0,0.4)",
              }}>
                <div style={{ background: "rgba(66,133,244,0.1)", borderRadius: 10, padding: "6px 8px", marginBottom: 8 }} className="flex items-center gap-2">
                  <span style={{ fontSize: 10 }}>🎯</span>
                  <div style={{ color: "#4285F4", fontSize: 9, fontWeight: 700 }}>Prepify</div>
                </div>
                {[
                  "Q: Tell me about SOLID",
                  "S = Single Responsibility…",
                  "Give me another one",
                  "Q: Explain async/await",
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start", marginBottom: 4 }}>
                    <div style={{ background: i % 2 === 0 ? "rgba(124,107,255,0.22)" : "rgba(255,255,255,0.06)", borderRadius: 8, padding: "3px 6px", fontSize: 7.5, color: i % 2 === 0 ? "#c4b5fd" : "rgba(255,255,255,0.55)", maxWidth: "85%" }}>{m}</div>
                  </div>
                ))}
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textAlign: "center", marginTop: 8 }}>Mobile App</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5 · CONNECTORS
      ══════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={connRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-16 ${connInView ? "in-view-fade-up" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#7C6BFF" }}>Integrations</div>
          <h2 className="font-outfit font-black text-white text-5xl sm:text-6xl mb-4">Connect everything.</h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Control everything.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CONNECTORS.map(({ name, Icon, color }, i) => (
            <div
              key={name}
              className={`flex flex-col items-center gap-3 rounded-2xl p-5 transition-all hover:-translate-y-1 cursor-default ${connInView ? "" : "opacity-0"}`}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                animation: connInView ? `connector-in 0.5s ${i * 0.07}s ease both` : "none",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18`, boxShadow: `0 0 18px ${color}20` }}
              >
                <Icon style={{ width: 22, height: 22, color }} />
              </div>
              <span className="text-xs text-slate-300 font-medium text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6 · CREATE YOUR OWN AGENT
      ══════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-6xl mx-auto" ref={createRef as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-16 ${createInView ? "in-view-fade-up" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#7C6BFF" }}>Build & earn</div>
          <h2 className="font-outfit font-black text-white text-5xl sm:text-6xl mb-4">Build once.<br />Earn forever.</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Create a custom agent for any niche. Publish to the marketplace and earn every time someone uses it.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Form side */}
          <div
            className={`card-glass p-8 ${createInView ? "in-view-slide-l" : "opacity-0"}`}
            style={{ animationDelay: "0.15s" }}
          >
            <div className="text-white font-bold font-outfit text-xl mb-6">Configure your agent</div>
            <div className="space-y-4">
              {[
                { label: "Agent name", val: agentName, set: setAgentName, ph: "e.g. ShopAssist" },
                { label: "Role", val: agentRole, set: setAgentRole, ph: "e.g. E-Commerce Bot" },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    value={val}
                    onChange={e => { set(e.target.value); setShowPreview(false); }}
                    placeholder={ph}
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">Instructions</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-slate-300 text-sm resize-none focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  defaultValue="Help users find the best deals on Meesho and Amazon. Compare prices and suggest the cheapest option."
                />
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <div className="text-white text-sm font-medium">Publish to marketplace</div>
                  <div className="text-slate-500 text-xs">Earn 30% of every paid usage</div>
                </div>
                <div
                  className="w-10 h-6 rounded-full relative cursor-pointer"
                  style={{ background: "rgba(124,107,255,0.7)" }}
                >
                  <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
              <button
                onClick={() => setShowPreview(true)}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #7C6BFF, #5b4ddb)", boxShadow: "0 0 30px rgba(124,107,255,0.35)" }}
              >
                Create Agent →
              </button>
            </div>
          </div>

          {/* Preview side */}
          <div className={`card-glass p-8 flex flex-col justify-between ${createInView ? "in-view-slide-r" : "opacity-0"}`} style={{ animationDelay: "0.25s" }}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="text-white font-bold font-outfit text-xl">Preview</div>
                {showPreview && (
                  <div className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                    Published ✓
                  </div>
                )}
              </div>

              {/* Agent card preview */}
              <div
                className="rounded-2xl p-6 mb-6 transition-all duration-700"
                style={{
                  background: showPreview ? "rgba(124,107,255,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${showPreview ? "rgba(124,107,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: showPreview ? "0 0 50px rgba(124,107,255,0.2)" : "none",
                  animation: showPreview ? "pop-in 0.5s ease" : "none",
                  opacity: agentName.trim() ? 1 : 0.4,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "rgba(124,107,255,0.15)" }}>
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold font-outfit text-lg">{agentName || "Your Agent"}</div>
                    <div className="text-purple-300 text-sm mb-3">{agentRole || "Custom Role"}</div>
                    <div className="flex flex-wrap gap-2">
                      {["Custom built", "Marketplace", "30% earnings"].map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(124,107,255,0.15)", color: "#c4b5fd", border: "1px solid rgba(124,107,255,0.3)" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission counter */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">Total earnings — Marketplace agents</div>
              <div className="font-outfit font-black text-4xl text-white mb-1">
                ₹{commissionCount.toLocaleString("en-IN")}
              </div>
              <div className="text-emerald-400 text-sm flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +₹340 this week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7 · STATS
      ══════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-5xl mx-auto" ref={statsRef as React.RefObject<HTMLDivElement>}>
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 ${statsInView ? "in-view-fade-up" : "opacity-0"}`}>
          <StatCard value={8}  label="Specialist Agents" active={statsInView} />
          <StatCard value={10} suffix="+" label="App Connectors"   active={statsInView} />
          <StatCard value={50} label="Free Messages / Day" active={statsInView} />
          <StatCard text="🇮🇳 #1" label="India First"         active={statsInView} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8 · CTA
      ══════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden" ref={ctaRef as React.RefObject<HTMLDivElement>}>
        {/* Big glow orb */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none orb-pulse"
          style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(124,107,255,0.28) 0%, transparent 70%)" }}
        />

        <div className={`relative z-10 max-w-3xl mx-auto text-center ${ctaInView ? "in-view-fade-up" : "opacity-0"}`}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "#7C6BFF" }}>Ready?</div>
          <h2 className="font-outfit font-black text-white text-5xl sm:text-7xl leading-[1.05] mb-6">
            Your AI team<br />is ready.
          </h2>
          <p className="text-slate-400 text-xl mb-10">
            Start free. No credit card.<br />Just Nexus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onShowAuth("signup")}
              className="group relative inline-flex items-center gap-2 px-10 py-5 rounded-full font-bold text-white text-lg overflow-hidden transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7C6BFF, #5b4ddb)", boxShadow: "0 0 60px rgba(124,107,255,0.5)" }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate("agent")}
              className="inline-flex items-center gap-2 px-8 py-5 rounded-full font-semibold text-white transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Browse Agents
            </button>
          </div>

          <p className="text-slate-600 text-sm mt-8">50 free messages daily · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-outfit font-black text-xl text-white">BotBetter <span className="text-gradient">Nexus</span></div>
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
