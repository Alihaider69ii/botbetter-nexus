import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { ArrowRight, Zap, Globe, Shield, Mic, Cpu, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Multi-Task AI",
    color: "#F59E0B",
    desc: "Send 4 tasks simultaneously — Nexus handles them in parallel like JARVIS. WhatsApp, Gmail, Calendar, Search — all at once.",
    demo: "\"Send WhatsApp to mom and also book calendar event and also check my email\" → 3 tasks run in parallel instantly.",
  },
  {
    icon: Mic,
    title: "Voice-First AI",
    color: "#EF4444",
    desc: "Speak in 11 Indian languages. Choose Maya (warm & expressive) or Kabir (direct & professional). Clap twice to activate on mobile.",
    demo: "Hindi, Urdu, Bengali, Tamil, Telugu, Gujarati, Punjabi, Kannada, Malayalam, Marathi, English.",
  },
  {
    icon: Globe,
    title: "50+ Connectors",
    color: "#3B82F6",
    desc: "WhatsApp, Gmail, Google Calendar, Instagram, Telegram, Notion, GitHub, Razorpay and 40+ more. One AI controls all your apps.",
    demo: "\"Draft a reply to my last email and post it\" → Nexus reads email, writes reply, sends it.",
  },
  {
    icon: Layers,
    title: "Agentic Memory",
    color: "#8B5CF6",
    desc: "Nexus remembers your preferences, project context, and past conversations. Set custom behaviors for how you want it to act.",
    demo: "Set: \"Always respond in Hindi. Keep answers under 3 lines.\" — Nexus follows forever.",
  },
  {
    icon: Cpu,
    title: "Multi-AI Backend",
    color: "#10B981",
    desc: "Powered by Gemini, Groq, Mistral, DeepSeek, and Together AI — with automatic failover. 99.9% uptime guaranteed.",
    demo: "If one AI provider goes down, Nexus switches to backup automatically in milliseconds.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    color: "#6C00FF",
    desc: "End-to-end encrypted conversations. No data selling. Indian data privacy compliant. Delete your data anytime.",
    demo: "Your conversations never leave our secure servers without your permission.",
  },
];

const COMPARISON = [
  { feature: "Indian Languages", nexus: true, chatgpt: false, bard: false },
  { feature: "WhatsApp Integration", nexus: true, chatgpt: false, bard: false },
  { feature: "Voice Mode", nexus: true, chatgpt: false, bard: true },
  { feature: "Multi-task Parallel Execution", nexus: true, chatgpt: false, bard: false },
  { feature: "Gmail & Calendar", nexus: true, chatgpt: false, bard: true },
  { feature: "Free Plan", nexus: true, chatgpt: true, bard: true },
  { feature: "Referral System", nexus: true, chatgpt: false, bard: false },
  { feature: "Indian Payment Apps", nexus: true, chatgpt: false, bard: false },
];

export const LearnMore = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => (
  <DashShell active={active} onNavigate={onNavigate} title="Learn More">
    <div className="p-4 sm:p-8 space-y-14 max-w-5xl mx-auto">

      {/* Hero */}
      <div className="text-center space-y-5 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
          India's First Agentic AI
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground leading-tight">
          BotBetter Nexus —<br />
          <span className="bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] bg-clip-text text-transparent">
            Your AI That Actually Does Things
          </span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
          Not just a chatbot. An agentic AI that sends messages, books events, manages emails, and executes tasks — simultaneously — in your language.
        </p>
        <button
          onClick={() => onNavigate("chat")}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-xl transition hover:-translate-y-1"
          style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)", boxShadow:"0 8px 32px rgba(108,0,255,0.35)" }}
        >
          Start for Free <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Features grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What makes Nexus different</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bento-card p-6 flex flex-col gap-4 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl grid place-items-center" style={{ background: f.color + "18", border: `1px solid ${f.color}30` }}>
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">{f.desc}</p>
              </div>
              <div className="mt-auto rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Example</div>
                <p className="text-xs text-muted-foreground font-medium italic">{f.demo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Nexus vs Others</h2>
        <div className="bento-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Feature</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest text-center">Nexus</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">ChatGPT</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Gemini</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-primary/[0.02]" : ""}>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-lg">{row.nexus ? "✅" : "❌"}</td>
                    <td className="px-6 py-4 text-center text-lg">{row.chatgpt ? "✅" : "❌"}</td>
                    <td className="px-6 py-4 text-center text-lg">{row.bard ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing teaser */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Simple Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { plan: "Free", price: "₹0", msgs: "50/day", color: "#6B7280", features: ["All languages", "Voice mode", "2 connectors", "Referral bonus"] },
            { plan: "Starter", price: "₹299/mo", msgs: "500/day", color: "#6C00FF", features: ["Everything in Free", "All connectors", "Priority AI", "Custom behavior"], popular: true },
            { plan: "Pro", price: "₹999/mo", msgs: "5000/day", color: "#FF3CAC", features: ["Everything in Starter", "Webhooks", "Plugin access", "Team sharing"] },
          ].map((p) => (
            <div key={p.plan} className={`bento-card p-6 flex flex-col ${p.popular ? "border-primary/40 bg-primary/5" : ""}`}>
              {p.popular && (
                <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white mb-4" style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)" }}>
                  Most Popular
                </div>
              )}
              <div className="font-bold text-lg text-foreground">{p.plan}</div>
              <div className="text-3xl font-bold mt-2 mb-1" style={{ color: p.color }}>{p.price}</div>
              <div className="text-xs text-muted-foreground font-semibold mb-5">{p.msgs} messages</div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
                    <span className="text-emerald-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate("chat")}
                className="w-full py-3 rounded-xl text-sm font-bold transition text-white"
                style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bento-card border-primary/25 bg-primary/5 p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Ready to experience agentic AI?</h2>
        <p className="text-muted-foreground font-medium">Start free. No credit card needed. 50 messages/day.</p>
        <button
          onClick={() => onNavigate("chat")}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-xl transition hover:-translate-y-1"
          style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)", boxShadow:"0 8px 32px rgba(108,0,255,0.25)" }}
        >
          Start Chatting Free <ArrowRight className="h-5 w-5" />
        </button>
      </div>

    </div>
  </DashShell>
);
