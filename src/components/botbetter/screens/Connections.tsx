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
  // ── Communication ─────────────────────────────────────────────
  { name: "WhatsApp", desc: "Send & automate messages", color: "#25D366", letter: "W", connected: true, category: "Communication" },
  { name: "WhatsApp Business", desc: "Business catalog & bulk messaging", color: "#25D366", letter: "WB", connected: false, category: "Communication" },
  { name: "Telegram", desc: "Bot replies and channel automation", color: "#2AABEE", letter: "T", connected: false, category: "Communication" },
  { name: "Gmail", desc: "Draft, send and triage emails", color: "#EA4335", letter: "G", connected: true, category: "Communication" },
  { name: "Slack", desc: "Team notifications & workflows", color: "#4A154B", letter: "S", connected: false, category: "Communication" },
  { name: "Discord", desc: "Server management & bots", color: "#5865F2", letter: "D", connected: false, category: "Communication" },
  { name: "Signal", desc: "Encrypted private messaging", color: "#3A76F0", letter: "Si", connected: false, category: "Communication" },
  { name: "Zoom", desc: "Meeting scheduling & summaries", color: "#2D8CFF", letter: "Zm", connected: false, category: "Communication" },
  { name: "Google Meet", desc: "Video calls & calendar sync", color: "#00897B", letter: "GM", connected: false, category: "Communication" },

  // ── Productivity ──────────────────────────────────────────────
  { name: "Google Calendar", desc: "Events, slots, and reminders", color: "#4285F4", letter: "C", connected: true, category: "Productivity" },
  { name: "Google Drive", desc: "File management and search", color: "#0F9D58", letter: "Dr", connected: false, category: "Productivity" },
  { name: "Notion", desc: "Docs, wikis, and databases", color: "#FFFFFF", letter: "N", connected: false, category: "Productivity" },
  { name: "Microsoft Teams", desc: "Team collaboration hub", color: "#6264A7", letter: "T", connected: false, category: "Productivity" },
  { name: "Trello", desc: "Kanban boards & card automation", color: "#0052CC", letter: "Tr", connected: false, category: "Productivity" },
  { name: "Asana", desc: "Task & project management", color: "#F06A6A", letter: "As", connected: false, category: "Productivity" },
  { name: "Jira", desc: "Issue tracking & sprints", color: "#0052CC", letter: "Ji", connected: false, category: "Productivity" },
  { name: "Monday.com", desc: "Visual work management", color: "#FF3D57", letter: "Mo", connected: false, category: "Productivity" },
  { name: "ClickUp", desc: "All-in-one productivity suite", color: "#7B68EE", letter: "CU", connected: false, category: "Productivity" },
  { name: "Airtable", desc: "Spreadsheet-database hybrid", color: "#FFBF00", letter: "AT", connected: false, category: "Productivity" },
  { name: "Figma", desc: "Design file access & comments", color: "#F24E1E", letter: "Fi", connected: false, category: "Productivity" },
  { name: "Canva", desc: "Create & edit designs with AI", color: "#00C4CC", letter: "Cv", connected: false, category: "Productivity" },

  // ── Social ────────────────────────────────────────────────────
  { name: "Instagram", desc: "DMs, comments, and reels", color: "#DD2A7B", gradient: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", letter: "I", connected: false, category: "Social" },
  { name: "YouTube", desc: "Video data and analytics", color: "#FF0000", letter: "Y", connected: false, category: "Social" },
  { name: "Twitter / X", desc: "Tweets, trends, and mentions", color: "#1DA1F2", letter: "X", connected: false, category: "Social" },
  { name: "LinkedIn", desc: "Professional networking", color: "#0077B5", letter: "in", connected: false, category: "Social" },

  // ── Business ──────────────────────────────────────────────────
  { name: "Razorpay", desc: "Payments and transactions", color: "#3395FF", letter: "R", connected: false, category: "Business" },
  { name: "Meesho", desc: "Reseller store automation", color: "#9B2D8E", letter: "M", connected: false, category: "Business" },
  { name: "Amazon", desc: "Orders and seller tools", color: "#FF9900", letter: "A", connected: false, category: "Business" },
  { name: "Zerodha", desc: "Portfolio and trade alerts", color: "#387ED1", letter: "Z", connected: false, category: "Business" },

  // ── Indian Apps ───────────────────────────────────────────────
  { name: "Paytm", desc: "UPI payments & wallet management", color: "#002970", letter: "Pay", connected: false, category: "Indian Apps" },
  { name: "PhonePe", desc: "UPI transfers and bill payments", color: "#5F259F", letter: "PP", connected: false, category: "Indian Apps" },
  { name: "Google Pay", desc: "GPay UPI & offers tracking", color: "#4285F4", gradient: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)", letter: "G", connected: false, category: "Indian Apps" },
  { name: "BHIM UPI", desc: "Direct bank UPI automation", color: "#FF6B00", letter: "UPI", connected: false, category: "Indian Apps" },
  { name: "Flipkart", desc: "Orders, tracking & deals", color: "#2874F0", letter: "F", connected: false, category: "Indian Apps" },
  { name: "Myntra", desc: "Fashion orders & wishlist", color: "#FF3F6C", letter: "Mn", connected: false, category: "Indian Apps" },
  { name: "Swiggy", desc: "Food orders and reordering", color: "#FC8019", letter: "Sw", connected: false, category: "Indian Apps" },
  { name: "Zomato", desc: "Restaurant orders & reviews", color: "#E23744", letter: "Zo", connected: false, category: "Indian Apps" },
  { name: "Ola", desc: "Ride bookings & history", color: "#1C1C1C", letter: "Ola", connected: false, category: "Indian Apps" },
  { name: "Uber", desc: "Rides, trips, and receipts", color: "#000000", letter: "Ub", connected: false, category: "Indian Apps" },

  // ── AI Tools ──────────────────────────────────────────────────
  { name: "ChatGPT", desc: "OpenAI GPT-4 integration", color: "#10A37F", letter: "GP", connected: false, category: "AI Tools" },
  { name: "Claude", desc: "Anthropic Claude AI models", color: "#D97706", letter: "C", connected: false, category: "AI Tools" },
  { name: "Perplexity", desc: "AI-powered search engine", color: "#6B46C1", letter: "Px", connected: false, category: "AI Tools" },
  { name: "Codex / Copilot", desc: "GitHub AI code assistant", color: "#10B981", letter: "Cx", connected: false, category: "AI Tools" },

  // ── Developer ─────────────────────────────────────────────────
  { name: "GitHub", desc: "Repos, issues, and PRs", color: "#6e7681", letter: "GH", connected: false, category: "Developer" },
  { name: "Vercel", desc: "Deployments and previews", color: "#888888", letter: "▲", connected: false, category: "Developer" },
  { name: "Railway", desc: "Cloud infra & deployments", color: "#7C3AED", letter: "Rail", connected: false, category: "Developer" },
  { name: "Render", desc: "Web services & static sites", color: "#46E3B7", letter: "Rnd", connected: false, category: "Developer" },
  { name: "Netlify", desc: "JAMstack & serverless deploys", color: "#00C7B7", letter: "Net", connected: false, category: "Developer" },
  { name: "AWS", desc: "Amazon cloud services", color: "#FF9900", letter: "AWS", connected: false, category: "Developer" },
  { name: "Supabase", desc: "Open-source Firebase alternative", color: "#3ECF8E", letter: "SB", connected: false, category: "Developer" },
  { name: "MongoDB Atlas", desc: "Cloud database management", color: "#47A248", letter: "MDB", connected: false, category: "Developer" },
  { name: "Webhook", desc: "Custom HTTP integrations", color: "#6C00FF", letter: "⚡", connected: false, category: "Developer" },
];

const CATEGORIES = [
  "Communication",
  "Productivity",
  "Social",
  "Business",
  "Indian Apps",
  "AI Tools",
  "Developer",
];

const CATEGORY_ICONS: Record<string, string> = {
  "Communication": "💬",
  "Productivity": "⚡",
  "Social": "🌐",
  "Business": "💼",
  "Indian Apps": "🇮🇳",
  "AI Tools": "🤖",
  "Developer": "🛠️",
};

const BrandIcon = ({ color, letter, gradient, size = 48 }: {
  color: string; letter: string; gradient?: string; size?: number;
}) => {
  const isDark = color === "#000000" || color === "#1C1C1C";
  const isLight = color === "#FFFFFF" || color === "#FF9900" || color === "#FFBF00";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 12,
        background: gradient ?? color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isLight ? "#111" : isDark ? "#fff" : "#fff",
        fontWeight: 700, fontSize: letter.length > 2 ? size * 0.25 : size * 0.33,
        boxShadow: `0 4px 14px ${color === "#FFFFFF" || color === "#000000" ? "rgba(0,0,0,0.3)" : color + "40"}`,
        flexShrink: 0, letterSpacing: "-0.5px",
        border: color === "#FFFFFF" ? "1px solid rgba(0,0,0,0.1)" : "none",
      }}
    >
      {letter}
    </div>
  );
};

export const Connections = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (name: string) =>
    setConnectors((prev) => prev.map((c) => c.name === name ? { ...c, connected: !c.connected } : c));

  const copy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const visibleCategories = activeCategory ? [activeCategory] : CATEGORIES;

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
            : {
                background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`,
                border: "none", color: c.color === "#FFFFFF" || c.color === "#FF9900" || c.color === "#FFBF00" ? "#111" : "#fff",
                boxShadow: `0 4px 12px ${c.color === "#000000" ? "rgba(0,0,0,0.3)" : c.color + "33"}`,
              }
        }
        onMouseEnter={(e) => { if (!c.connected) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      >
        {c.connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Connectors">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            style={
              activeCategory === null
                ? { background: "linear-gradient(135deg, #6C00FF, #FF3CAC)", color: "#fff", boxShadow: "0 4px 12px rgba(108,0,255,0.25)" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
            }
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={
                activeCategory === cat
                  ? { background: "linear-gradient(135deg, #6C00FF, #FF3CAC)", color: "#fff", boxShadow: "0 4px 12px rgba(108,0,255,0.25)" }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Connector categories */}
        {visibleCategories.map((cat) => {
          const items = connectors.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <div className="mb-4">
                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">
                  {CATEGORY_ICONS[cat]} {cat.toUpperCase()}
                </div>
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
          <button className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all hover:-translate-y-0.5">
            <Plus className="h-4 w-4" />
            + Request a Connector
          </button>
        </div>

      </div>
    </DashShell>
  );
};
