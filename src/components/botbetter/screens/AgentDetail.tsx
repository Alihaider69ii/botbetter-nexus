import { useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { Check, MessageSquare, Send, Globe, Code2, ArrowRight } from "lucide-react";

const capabilities = [
  "Generate product titles + descriptions for Meesho/Amazon",
  "Optimize pricing based on competitor data",
  "Draft customer replies in Hindi/English",
  "Track inventory & restock alerts",
  "Bulk listing CSV export",
];

const sample = [
  { from: "user", text: "Meri Meesho saree ki listing improve kar do" },
  { from: "bot", text: "Sure! 3 SEO-optimized titles ready:\n1. Banarasi Silk Saree...\n2. Premium Wedding Saree...\n3. Festival Special..." },
];

const channels = [
  { name: "WhatsApp", icon: MessageSquare },
  { name: "Telegram", icon: Send },
  { name: "Website widget", icon: Globe },
  { name: "API", icon: Code2 },
];

export const AgentDetail = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [agentIdx, setAgentIdx] = useState(3); // Sellio
  const [billing, setBilling] = useState<"hourly" | "monthly" | "yearly">("monthly");
  const a = agents[agentIdx];

  const price = billing === "hourly" ? "₹29" : billing === "monthly" ? "₹199" : "₹1999";
  const per = billing === "hourly" ? "/hour" : billing === "monthly" ? "/month" : "/year";

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Agent Detail">
      <div className="p-4 sm:p-6 max-w-6xl">
        {/* Agent picker */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {agents.map((x, i) => (
            <button
              key={x.name}
              onClick={() => setAgentIdx(i)}
              className={`inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full border transition ${
                i === agentIdx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{x.emoji}</span> {x.name}
            </button>
          ))}
        </div>

        {/* Header */}
        <div
          className="rounded-2xl border bg-card p-6 sm:p-8"
          style={{ borderLeftColor: a.color, borderLeftWidth: 4 }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl grid place-items-center text-2xl"
                style={{ background: `${a.color}22`, border: `1px solid ${a.color}40` }}
              >
                {a.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl">{a.name}</h2>
                  <span className="inline-flex items-center gap-1 label-xs text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" /> ACTIVE
                  </span>
                </div>
                <div className="label-xs text-muted-foreground mt-0.5">{a.role.toUpperCase()}</div>
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[13px]">
              Connect to app <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-muted-foreground text-[14px] mt-4 max-w-2xl">{a.desc}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-4">
          {/* Capabilities */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <div className="label-xs text-muted-foreground">CAPABILITIES</div>
            <h3 className="text-lg mt-1 mb-4">What {a.name} can do</h3>
            <ul className="space-y-2">
              {capabilities.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[13px]">
                  <span
                    className="h-4 w-4 rounded grid place-items-center mt-0.5 shrink-0"
                    style={{ background: `${a.color}22`, color: a.color }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-border">
              <div className="label-xs text-muted-foreground mb-3">CONNECT TO</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {channels.map((c) => (
                  <button
                    key={c.name}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary text-[13px]"
                  >
                    <c.icon className="h-4 w-4 text-muted-foreground" /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="label-xs text-muted-foreground">PRICING</div>
            <h3 className="text-lg mt-1 mb-4">Choose billing</h3>
            <div className="flex gap-1 p-1 rounded-full border border-border bg-background mb-5">
              {(["hourly", "monthly", "yearly"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`flex-1 text-[12px] py-1.5 rounded-full capitalize transition ${
                    billing === b ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-medium">{price}</span>
              <span className="text-[12px] text-muted-foreground">{per}</span>
            </div>
            <button
              onClick={() => onNavigate("chat")}
              className="mt-5 w-full py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium"
            >
              Start chatting
            </button>
            <button className="mt-2 w-full py-2.5 rounded-full border border-border text-[13px]">
              Add to platform
            </button>
          </div>
        </div>

        {/* Sample conversation */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="label-xs text-muted-foreground">SAMPLE CONVERSATION</div>
          <h3 className="text-lg mt-1 mb-4">See {a.name} in action</h3>
          <div className="space-y-3">
            {sample.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-[13px]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-2">
                  <div
                    className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0"
                    style={{ background: `${a.color}22`, border: `1px solid ${a.color}40` }}
                  >
                    {a.emoji}
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2.5 text-[13px] whitespace-pre-line">
                    {m.text}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashShell>
  );
};
