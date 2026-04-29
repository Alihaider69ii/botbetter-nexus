import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import {
  ArrowRight, MessageSquare, Mail, Calendar, Send, Slack, Sparkles,
  Globe, Smartphone, Code2, BookOpen, ShoppingCart, Briefcase,
  TrendingUp, Zap, Lock, Dumbbell, ClipboardList,
  Camera, Heart, MapPin, FileText, Receipt, Bot,
  CheckCircle2, X, ChevronRight
} from "lucide-react";

export const Landing = ({
  onNavigate,
  onShowAuth,
}: {
  onNavigate: (s: ScreenKey) => void;
  onShowAuth: (tab: "login" | "signup") => void;
}) => {
  const others = agents.slice(1);

  const CX = 280, CY = 240, R = 160;
  const agentAngles = [-90, -18, 54, 126, 198];
  const agentPositions = others.map((agent, i) => {
    const angle = agentAngles[i] * Math.PI / 180;
    return { ...agent, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const connectors = [
    { Icon: MessageSquare, name: "WhatsApp", desc: "Send & receive messages", color: "#25D366" },
    { Icon: Mail, name: "Gmail", desc: "Read, draft & send emails", color: "#EA4335" },
    { Icon: Calendar, name: "Google Calendar", desc: "Schedule & set reminders", color: "#1967D2" },
    { Icon: Send, name: "Telegram", desc: "Automate bot messages", color: "#2AABEE" },
    { Icon: Slack, name: "Slack", desc: "Team updates & notifications", color: "#E01E5A" },
    { Icon: Camera, name: "Instagram DM", desc: "Manage DMs & comments", color: "#E1306C" },
    { Icon: Globe, name: "Browser Extension", desc: "Works right in your browser", color: "#7C6BFF" },
    { Icon: Smartphone, name: "Mobile App", desc: "Full access on iOS & Android", color: "#7C6BFF" },
    { Icon: Code2, name: "API Access", desc: "Integrate into your own apps", color: "#7C6BFF" },
  ];

  const useCases = [
    { Icon: BookOpen, title: "Crack any exam", desc: "Cracky helps you prepare for NEET, JEE, UPSC with personalized study plans", agent: "Cracky", color: "#F59E0B" },
    { Icon: ShoppingCart, title: "Grow your online store", desc: "Sellio writes listings, suggests prices, handles customer replies on Meesho/Amazon", agent: "Sellio", color: "#D85A30" },
    { Icon: Briefcase, title: "Ace every interview", desc: "Prepify conducts mock interviews and gives real feedback in Hindi/English", agent: "Prepify", color: "#1D9E75" },
    { Icon: TrendingUp, title: "Go viral on social media", desc: "Creato generates reel ideas, scripts, captions and content calendars", agent: "Creato", color: "#D4537E" },
    { Icon: Zap, title: "Master your finances", desc: "Finio creates budgets, explains SIP, saves tax — in simple Hinglish", agent: "Finio", color: "#1D9E75" },
    { Icon: Dumbbell, title: "Get fit your way", desc: "FlexAI builds workout and diet plans based on Indian lifestyle", agent: "FlexAI", color: "#7C6BFF" },
    { Icon: ClipboardList, title: "Never miss a task", desc: "Buddy manages your schedule, sends reminders, drafts emails for you", agent: "Buddy", color: "#7C6BFF" },
    { Icon: Bot, title: "Build your own AI", desc: "Create a custom agent for any niche and earn 30% when others use it", agent: "Custom", color: "#F59E0B" },
  ];

  const comingSoon = [
    { emoji: "⚖️", name: "LegalAI", desc: "Legal advice in simple Hindi" },
    { emoji: "🏥", name: "HealthAI", desc: "Symptom checker and health advice" },
    { emoji: "✈️", name: "TravelAI", desc: "Trip planning and booking assistant" },
    { emoji: "📄", name: "HRBot", desc: "Resume builder and job helper" },
    { emoji: "🧾", name: "TaxBot", desc: "Indian tax filing made simple" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", color: "white" }}>
      <style>{`
        @keyframes bb-node-pulse { 0%,100%{opacity:.12} 50%{opacity:.32} }
        @keyframes bb-hero-fade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .bb-agent-glow { animation: bb-node-pulse 3s ease-in-out infinite; }
        .bb-use-card { transition: transform .2s ease, border-color .2s ease; }
        .bb-use-card:hover { transform: translateY(-4px); border-color: rgba(124,107,255,.55) !important; }
        .bb-connector { transition: transform .2s ease, border-color .2s ease; }
        .bb-connector:hover { transform: translateY(-3px); border-color: rgba(124,107,255,.45) !important; }
        .bb-coming { transition: border-color .2s ease; }
        .bb-coming:hover { border-color: rgba(124,107,255,.4) !important; }
        .bb-cta:hover { opacity: .85; }
      `}</style>

      {/* Navbar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md grid place-items-center" style={{ background: "#7C6BFF" }}>
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-white">BotBetter</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowAuth("login")}
              className="text-[13px] px-3 py-1.5 text-gray-400 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => onShowAuth("signup")}
              className="text-[13px] px-4 py-1.5 rounded-full font-medium transition bb-cta"
              style={{ background: "#7C6BFF", color: "white" }}
            >
              Sign up free
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,107,255,0.18) 0%, transparent 70%)" }}>
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
            style={{ border: "1px solid rgba(124,107,255,0.25)", background: "rgba(124,107,255,0.07)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            <span className="text-[11px] font-semibold tracking-widest text-gray-400">INDIA'S FIRST AGENTIC AI PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl tracking-tight leading-[1.05] text-white font-bold">
            Meet{" "}
            <span style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #A78BFA 50%, #C4B5FD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Nexus.
            </span>
            <br />Your AI that does everything.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Connect Nexus to your apps — or pick a specialist agent. One platform, infinite intelligence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <button
              onClick={() => onNavigate("dashboard")}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold transition"
              style={{ background: "linear-gradient(135deg, #7C6BFF, #5B4FCC)", color: "white", boxShadow: "0 0 30px rgba(124,107,255,0.4)" }}
            >
              Connect full platform
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </button>
            <button
              onClick={() => onNavigate("agent")}
              className="px-6 py-3 rounded-full text-[14px] font-medium transition"
              style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "white" }}
            >
              Browse agents
            </button>
          </div>
        </div>

        {/* Jarvis Visualization */}
        <div className="max-w-2xl mx-auto px-6 pb-28">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500">NEXUS INTELLIGENCE NETWORK</span>
            <p className="text-gray-300 mt-1 text-sm">Every agent, every task — orchestrated in real time</p>
          </div>

          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "radial-gradient(ellipse at 50% 40%, #100828 0%, #06040E 70%)",
              border: "1px solid rgba(124,107,255,0.22)",
              boxShadow: "0 0 80px rgba(124,107,255,0.12), inset 0 0 40px rgba(124,107,255,0.04)",
            }}
          >
            <svg viewBox="0 0 560 500" className="w-full" style={{ display: "block" }}>
              <defs>
                <radialGradient id="nexusAura" cx="50%" cy="48%" r="18%">
                  <stop offset="0%" stopColor="#7C6BFF" stopOpacity="1" />
                  <stop offset="60%" stopColor="#5B4FCC" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7C6BFF" stopOpacity="0" />
                </radialGradient>
                <filter id="glow-sm">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-lg">
                  <feGaussianBlur stdDeviation="7" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {agentPositions.map((a) => (
                  <radialGradient key={`grad-${a.name}`} id={`grad-${a.name}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={a.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={a.color} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {/* Outermost faint ring */}
              <circle cx={CX} cy={CY} r="218" fill="none" stroke="#7C6BFF" strokeWidth="0.4" strokeDasharray="3 18" opacity="0.18">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="40s" repeatCount="indefinite" />
              </circle>

              {/* Mid ring */}
              <circle cx={CX} cy={CY} r="178" fill="none" stroke="#4B45FF" strokeWidth="0.5" strokeDasharray="5 22" opacity="0.14">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="28s" repeatCount="indefinite" />
              </circle>

              {/* Inner ring */}
              <circle cx={CX} cy={CY} r="130" fill="none" stroke="#7C6BFF" strokeWidth="1" strokeDasharray="4 12" opacity="0.22">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="18s" repeatCount="indefinite" />
              </circle>

              {/* Orbit track (solid faint) */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(124,107,255,0.1)" strokeWidth="1" />

              {/* Connecting lines */}
              {agentPositions.map((agent, i) => (
                <line
                  key={`line-${agent.name}`}
                  x1={CX} y1={CY}
                  x2={agent.x} y2={agent.y}
                  stroke={agent.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                  opacity="0.55"
                >
                  <animate attributeName="stroke-dashoffset" from="110" to="0" dur={`${1.6 + i * 0.45}s`} repeatCount="indefinite" />
                </line>
              ))}

              {/* Nexus outer aura */}
              <circle cx={CX} cy={CY} r="80" fill="url(#nexusAura)">
                <animate attributeName="r" values="70;88;70" dur="3.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.55;0.9;0.55" dur="3.2s" repeatCount="indefinite" />
              </circle>

              {/* Nexus pulse ring 1 */}
              <circle cx={CX} cy={CY} r="56" fill="none" stroke="#7C6BFF" strokeWidth="1.5" opacity="0.65">
                <animate attributeName="r" values="50;70;50" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.65;0.05;0.65" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Nexus pulse ring 2 (offset) */}
              <circle cx={CX} cy={CY} r="44" fill="none" stroke="#A78BFA" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="42;60;42" dur="3s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="3s" begin="1s" repeatCount="indefinite" />
              </circle>

              {/* Nexus body */}
              <circle cx={CX} cy={CY} r="44" fill="#0D0820" stroke="#7C6BFF" strokeWidth="2" filter="url(#glow-lg)" />
              <circle cx={CX} cy={CY} r="36" fill="rgba(124,107,255,0.14)" />

              {/* Nexus icon + label */}
              <text x={CX} y={CY - 3} textAnchor="middle" fontSize="20" fill="#7C6BFF">⚡</text>
              <text x={CX} y={CY + 17} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="white" letterSpacing="2.5" opacity="0.9">NEXUS</text>

              {/* Agent nodes */}
              {agentPositions.map((agent) => (
                <g key={agent.name}>
                  <circle cx={agent.x} cy={agent.y} r="34" fill={`url(#grad-${agent.name})`} className="bb-agent-glow" />
                  <circle cx={agent.x} cy={agent.y} r="24" fill="#08061A" stroke={agent.color} strokeWidth="1.8" filter="url(#glow-sm)" />
                  <circle cx={agent.x} cy={agent.y} r="18" fill={agent.color} opacity="0.1" />
                  <text x={agent.x} y={agent.y + 7} textAnchor="middle" fontSize="15" opacity="0.92">{agent.emoji}</text>
                  <text x={agent.x} y={agent.y + 42} textAnchor="middle" fontSize="11" fontWeight="600" fill="white" opacity="0.9">{agent.name}</text>
                  <text x={agent.x} y={agent.y + 56} textAnchor="middle" fontSize="8.5" fill="#888" opacity="0.75" letterSpacing="0.5">{agent.role.toUpperCase()}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* WHY BOTBETTER — Section A: Why we built this */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, #0A0A0F 0%, #0E0818 100%)" }} className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500">WHY BOTBETTER</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-white leading-tight">
              Built because AI should work{" "}
              <span style={{ background: "linear-gradient(135deg,#7C6BFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                FOR
              </span>{" "}
              you —<br className="hidden sm:block" /> not the other way around.
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-base leading-relaxed">
              We were tired of switching between 10 different AI tools, copy-pasting prompts, and still doing everything manually. So we built Nexus — one agentic platform that actually executes.
            </p>
          </div>

          {/* Old Way vs New Way */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Old Way */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,60,60,0.04)", border: "1px solid rgba(255,60,60,0.15)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <X className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400 tracking-wide">THE OLD WAY</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {["ChatGPT", "Gemini", "Canva AI", "Notion AI", "Copy.ai", "Jasper"].map((tool) => (
                  <div
                    key={tool}
                    className="rounded-xl px-2 py-2.5 text-center text-[11px] text-gray-500 font-medium"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {tool}
                  </div>
                ))}
              </div>
              <ul className="space-y-2.5 text-[13px] text-gray-500">
                {["Switch between 10+ different tools", "Copy-paste your prompts every time", "No memory, no context, no execution", "Pay subscriptions to 5 different apps"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <X className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* New Way */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(124,107,255,0.06)", border: "1px solid rgba(124,107,255,0.22)", boxShadow: "0 0 40px rgba(124,107,255,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 className="h-4 w-4 text-[#7C6BFF]" />
                <span className="text-sm font-semibold tracking-wide" style={{ color: "#7C6BFF" }}>THE BOTBETTER WAY</span>
              </div>
              <div
                className="rounded-xl p-4 mb-5 text-center"
                style={{ background: "rgba(124,107,255,0.1)", border: "1px solid rgba(124,107,255,0.25)" }}
              >
                <span className="text-2xl">⚡</span>
                <div className="mt-1 font-bold text-white text-sm tracking-widest">NEXUS</div>
                <div className="text-[11px] text-gray-400 mt-0.5">One platform. All agents. Every task.</div>
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  {["Buddy", "Prepify", "Sellio", "Creato", "Finio"].map((a) => (
                    <span
                      key={a}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: "rgba(124,107,255,0.18)", color: "#A78BFA", border: "1px solid rgba(124,107,255,0.2)" }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="space-y-2.5 text-[13px] text-gray-300">
                {["One platform for all your AI needs", "Agents that remember you and execute", "Connected to your apps — WhatsApp, Gmail", "Start free, scale when you're ready"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#7C6BFF" }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: What you can do with BotBetter */}
      <section style={{ background: "#0A0A0F", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500">USE CASES</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-white">What you can do with BotBetter</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">Built for real problems that real Indians face every day.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map(({ Icon, title, desc, agent, color }) => (
              <div
                key={title}
                className="rounded-2xl p-5 bb-use-card"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="font-semibold text-white text-[14px] mb-1.5">{title}</div>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-4">{desc}</p>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                >
                  via {agent}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section C: Connectors */}
      <section style={{ background: "linear-gradient(180deg,#0E0818 0%,#0A0A0F 100%)", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500">INTEGRATIONS</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-white">Works with your favorite apps</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">Connect Nexus to the tools you already use — no switching required.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {connectors.map(({ Icon, name, desc, color }) => (
              <div
                key={name}
                className="rounded-2xl p-5 bb-connector"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", cursor: "default" }}
              >
                <div
                  className="h-11 w-11 rounded-xl grid place-items-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="font-semibold text-white text-[14px]">{name}</div>
                <p className="text-[12px] text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section D: Coming soon agents */}
      <section style={{ background: "#0A0A0F", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500">ROADMAP</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-white">We're just getting started.</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
              New specialist agents launching every month — each one trained for a specific Indian use case.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {comingSoon.map(({ emoji, name, desc }) => (
              <div
                key={name}
                className="rounded-2xl p-4 text-center bb-coming"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  filter: "saturate(0.5)",
                  cursor: "default",
                }}
              >
                <div
                  className="h-11 w-11 rounded-xl grid place-items-center mx-auto mb-3"
                  style={{ background: "rgba(124,107,255,0.1)", border: "1px solid rgba(124,107,255,0.15)" }}
                >
                  <span className="text-xl" style={{ filter: "blur(0px) grayscale(0.3)" }}>{emoji}</span>
                </div>
                <Lock className="h-3 w-3 text-gray-600 mx-auto mb-1.5" />
                <div className="font-semibold text-gray-400 text-[13px]">{name}</div>
                <p className="text-[11px] text-gray-600 mt-1 leading-snug">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">Have an idea for an agent?</p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold transition bb-cta"
              style={{ background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.35)", color: "#A78BFA" }}
            >
              Request an agent
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Access modes */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg,#0E0818 0%,#0A0A0F 100%)" }} className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500">ACCESS MODES</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-white">Three ways to use BotBetter</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Full platform", desc: "Nexus + all 5 specialist agents working together.", tag: "POPULAR", num: "01" },
              { title: "Single agent", desc: "Pick one specialist for a focused workflow.", tag: null, num: "02" },
              { title: "Upgrade anytime", desc: "Start with one, add more as you grow.", tag: null, num: "03" },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl p-6 transition"
                style={{
                  background: c.tag ? "rgba(124,107,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: c.tag ? "1px solid rgba(124,107,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: c.tag ? "0 0 30px rgba(124,107,255,0.1)" : "none",
                }}
              >
                {c.tag && (
                  <span
                    className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(124,107,255,0.18)", color: "#A78BFA", border: "1px solid rgba(124,107,255,0.25)" }}
                  >
                    {c.tag}
                  </span>
                )}
                <div className="mt-4 text-3xl font-bold" style={{ color: "rgba(124,107,255,0.4)" }}>{c.num}</div>
                <div className="font-semibold text-white mt-2">{c.title}</div>
                <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,107,255,0.12) 0%, transparent 70%)" }} className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to let AI do the work?
          </h2>
          <p className="text-gray-400 mb-8 text-base">
            Join thousands of Indians using BotBetter to study, sell, create, and grow — on autopilot.
          </p>
          <button
            onClick={() => onNavigate("dashboard")}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold transition bb-cta"
            style={{ background: "linear-gradient(135deg,#7C6BFF,#5B4FCC)", color: "white", boxShadow: "0 0 40px rgba(124,107,255,0.45)" }}
          >
            Start for free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
          </button>
          <p className="text-gray-600 text-[12px] mt-4">No credit card required.</p>
        </div>
      </section>
    </div>
  );
};
