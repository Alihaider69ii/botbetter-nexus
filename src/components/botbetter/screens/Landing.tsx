import { agents } from "@/data/agents";
import { ScreenKey } from "./TopNav";
import { ArrowRight, Check, MessageSquare, Mail, Calendar, Send, Slack, Sparkles } from "lucide-react";

const apps = [
  { name: "WhatsApp", icon: MessageSquare },
  { name: "Gmail", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Telegram", icon: Send },
  { name: "Slack", icon: Slack },
];

export const Landing = ({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) => {
  const nexus = agents[0];
  const others = agents.slice(1);

  return (
    <div className="min-h-screen">
      {/* Mini navbar inside landing */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary grid place-items-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-medium">BotBetter</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[13px] px-3 py-1.5 text-muted-foreground hover:text-foreground">Login</button>
            <button className="text-[13px] px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90">
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="gradient-bg">
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <span className="label-xs text-muted-foreground">INDIA'S FIRST AGENTIC AI PLATFORM</span>
          </div>
          <h1 className="text-4xl sm:text-6xl tracking-tight leading-[1.05]">
            Meet <span className="gradient-text">Nexus.</span>
            <br /> Your AI that does everything.
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mt-6 max-w-2xl mx-auto">
            Connect BotBetter to your apps — or pick a specialist agent. One platform, six brains, infinite tasks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => onNavigate("dashboard")}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition"
            >
              Connect full platform
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </button>
            <button
              onClick={() => onNavigate("agent")}
              className="px-5 py-2.5 rounded-full border border-border bg-card text-[13px] font-medium hover:bg-secondary transition"
            >
              Browse agents
            </button>
          </div>
        </div>

        {/* Architecture */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="relative rounded-2xl border border-border bg-card/50 p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="label-xs text-muted-foreground">PLATFORM ARCHITECTURE</div>
              <h3 className="text-xl mt-1">Nexus orchestrates everything</h3>
            </div>
            <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-3 items-center">
              {/* Nexus center */}
              <div className="col-span-3 sm:col-span-6 flex justify-center mb-2">
                <div
                  className="rounded-2xl px-5 py-4 border-2 glow-purple"
                  style={{ background: `${nexus.color}1a`, borderColor: nexus.color }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{nexus.emoji}</div>
                    <div>
                      <div className="font-medium">{nexus.name}</div>
                      <div className="label-xs text-muted-foreground">MASTER AGENT</div>
                    </div>
                  </div>
                </div>
              </div>
              {others.map((a) => (
                <div
                  key={a.name}
                  className="rounded-xl border border-border bg-card p-3 text-center hover:border-primary/40 transition"
                  style={{ borderTopColor: a.color, borderTopWidth: 2 }}
                >
                  <div className="text-xl">{a.emoji}</div>
                  <div className="text-[12px] mt-1 font-medium">{a.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Works with */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <span className="label-xs text-muted-foreground">WORKS WITH</span>
          {apps.map((a) => (
            <div key={a.name} className="flex items-center gap-2 text-muted-foreground">
              <a.icon className="h-4 w-4" />
              <span className="text-[13px]">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Access modes */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="label-xs text-muted-foreground">ACCESS MODES</div>
          <h2 className="text-3xl mt-2">Three ways to use BotBetter</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Full platform", desc: "Nexus + all 5 specialist agents working together.", tag: "POPULAR" },
            { title: "Single agent", desc: "Pick one specialist for a focused workflow.", tag: null },
            { title: "Upgrade anytime", desc: "Start with one, add more as you grow.", tag: null },
          ].map((c, i) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition"
            >
              {c.tag && (
                <span className="label-xs text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-full">
                  {c.tag}
                </span>
              )}
              <div className="mt-4 text-2xl font-medium">0{i + 1}</div>
              <div className="font-medium mt-2">{c.title}</div>
              <p className="text-[13px] text-muted-foreground mt-2">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-12">
          <div className="label-xs text-muted-foreground">PRICING</div>
          <h2 className="text-3xl mt-2">Start free. Scale as you go.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: "Free", price: "₹0", features: ["1 agent", "100 messages", "Community"] },
            { name: "Basic", price: "₹199", features: ["3 agents", "5K messages", "Email support"] },
            { name: "Pro", price: "₹499", features: ["All agents", "50K messages", "API access"], highlight: true },
            { name: "Unlimited", price: "₹999", features: ["Everything", "Unlimited", "Priority support"] },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-6 transition ${
                p.highlight ? "border-primary bg-primary/5 glow-purple" : "border-border bg-card"
              }`}
            >
              <div className="label-xs text-muted-foreground">{p.name.toUpperCase()}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-medium">{p.price}</span>
                <span className="text-[12px] text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full py-2 rounded-full text-[13px] transition ${
                  p.highlight
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-secondary"
                }`}
              >
                Choose {p.name}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
