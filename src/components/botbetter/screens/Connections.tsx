import { useState } from "react";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { Copy, Check, Plus } from "lucide-react";

type Connector = {
  name: string;
  desc: string;
  color: string;
  letter: string;
  gradient?: string;
  connected: boolean;
  category: string;
};

const INITIAL_CONNECTORS: Connector[] = [
  // Communication
  { name: "WhatsApp", desc: "Send & automate messages", color: "#25D366", letter: "W", connected: true, category: "Communication" },
  { name: "Telegram", desc: "Bot replies and automation", color: "#2AABEE", letter: "T", connected: false, category: "Communication" },
  { name: "Gmail", desc: "Draft, send and triage emails", color: "#EA4335", letter: "G", connected: true, category: "Communication" },
  { name: "Slack", desc: "Team notifications & workflows", color: "#4A154B", letter: "S", connected: false, category: "Communication" },
  { name: "Discord", desc: "Server management & bots", color: "#5865F2", letter: "D", connected: false, category: "Communication" },
  // Productivity
  { name: "Google Calendar", desc: "Events, slots, and reminders", color: "#4285F4", letter: "C", connected: true, category: "Productivity" },
  { name: "Google Drive", desc: "File management and search", color: "#0F9D58", letter: "D", connected: false, category: "Productivity" },
  { name: "Notion", desc: "Docs, wikis, and databases", color: "#FFFFFF", letter: "N", connected: false, category: "Productivity" },
  { name: "Microsoft Teams", desc: "Team collaboration hub", color: "#6264A7", letter: "T", connected: false, category: "Productivity" },
  // Social
  { name: "Instagram", desc: "DMs, comments, and reels", color: "#DD2A7B", gradient: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", letter: "I", connected: false, category: "Social" },
  { name: "YouTube", desc: "Video data and analytics", color: "#FF0000", letter: "Y", connected: false, category: "Social" },
  { name: "Twitter / X", desc: "Tweets, trends, and mentions", color: "#1DA1F2", letter: "X", connected: false, category: "Social" },
  { name: "LinkedIn", desc: "Professional networking", color: "#0077B5", letter: "in", connected: false, category: "Social" },
  // Business
  { name: "Razorpay", desc: "Payments and transactions", color: "#3395FF", letter: "R", connected: false, category: "Business" },
  { name: "Meesho", desc: "Reseller store automation", color: "#9B2D8E", letter: "M", connected: false, category: "Business" },
  { name: "Amazon", desc: "Orders and seller tools", color: "#FF9900", letter: "A", connected: false, category: "Business" },
  { name: "Zerodha", desc: "Portfolio and trade alerts", color: "#387ED1", letter: "Z", connected: false, category: "Business" },
  // Developer
  { name: "GitHub", desc: "Repos, issues, and PRs", color: "#6e7681", letter: "GH", connected: false, category: "Developer" },
  { name: "Vercel", desc: "Deployments and previews", color: "#888888", letter: "▲", connected: false, category: "Developer" },
  { name: "Webhook", desc: "Custom HTTP integrations", color: "#6C00FF", letter: "⚡", connected: false, category: "Developer" },
];

const CATEGORIES = ["Communication", "Productivity", "Social", "Business", "Developer"];

const BrandIcon = ({ color, letter, gradient, size = 48 }: {
  color: string; letter: string; gradient?: string; size?: number;
}) => (
  <div
    style={{
      width: size, height: size, borderRadius: 12,
      background: gradient ?? color,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: color === "#FFFFFF" || color === "#FF9900" ? "#111" : "#fff",
      fontWeight: 700, fontSize: size * 0.33,
      boxShadow: `0 4px 14px ${color}40`,
      flexShrink: 0, letterSpacing: "-0.5px",
    }}
  >
    {letter}
  </div>
);

export const Connections = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [copied, setCopied] = useState(false);

  const toggle = (name: string) =>
    setConnectors((prev) => prev.map((c) => c.name === name ? { ...c, connected: !c.connected } : c));

  const copy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ConnectorCard = ({ c }: { c: Connector }) => (
    <div className="bento-card p-5 flex flex-col hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <BrandIcon color={c.color} letter={c.letter} gradient={c.gradient} />
        {c.connected && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
          </span>
        )}
      </div>
      <div className="text-[15px] font-bold text-foreground">{c.name}</div>
      <p className="text-sm text-muted-foreground mt-1 flex-1 leading-relaxed">{c.desc}</p>
      <button
        onClick={() => toggle(c.name)}
        className="mt-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all"
        style={
          c.connected
            ? { background: "transparent", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
            : { background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`, border: "none", color: "#fff", boxShadow: `0 4px 12px ${c.color}33` }
        }
        onMouseEnter={(e) => {
          if (!c.connected) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "";
        }}
      >
        {c.connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Connectors">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-12">

        {CATEGORIES.map((cat) => {
          const items = connectors.filter((c) => c.category === cat);
          return (
            <div key={cat}>
              <div className="mb-4">
                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">{cat.toUpperCase()}</div>
                <h3 className="text-xl font-bold text-foreground">{cat}</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((c) => <ConnectorCard key={c.name} c={c} />)}
              </div>
            </div>
          );
        })}

        {/* API & Webhooks */}
        <div className="bento-card p-6 sm:p-8 bg-primary/5">
          <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">DEVELOPER ACCESS</div>
          <h3 className="text-2xl font-bold text-foreground mt-1">API & Webhooks</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Use Nexus from your own backend programmatically.
          </p>
          <div className="mt-8 space-y-6">
            <div>
              <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">API KEY</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm">
                <code className="text-sm flex-1 truncate font-mono font-bold text-foreground">bb_live_sk_8f4x...92ab</code>
                <button
                  onClick={() => copy("bb_live_sk_8f4x92ab")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">WEBHOOK URL</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm">
                <code className="text-sm flex-1 truncate font-mono font-bold text-foreground">https://api.botbetter.ai/v1/hooks/u_a1b2</code>
                <button
                  onClick={() => copy("https://api.botbetter.ai/v1/hooks/u_a1b2")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Request a connector */}
        <div className="flex justify-center pb-4">
          <button
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            + Request a Connector
          </button>
        </div>

      </div>
    </DashShell>
  );
};
