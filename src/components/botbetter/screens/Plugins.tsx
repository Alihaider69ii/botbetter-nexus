import { useState } from "react";
import { DashShell } from "../DashShell";
import { ScreenKey } from "../TopNav";
import { Puzzle, Zap, Lock, Check, Star, ExternalLink } from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  author: string;
  rating: number;
  installs: number;
  enabled: boolean;
  pro: boolean;
  color: string;
}

const PLUGINS: Plugin[] = [
  { id: "summarizer", name: "Smart Summarizer", desc: "Automatically summarize long documents, articles, and chat histories with one click.", icon: "📋", category: "Productivity", author: "BotBetter", rating: 4.8, installs: 1240, enabled: true, pro: false, color: "#6C00FF" },
  { id: "scheduler", name: "AI Scheduler", desc: "Suggest the best meeting times, auto-book slots, and send calendar invites.", icon: "📅", category: "Productivity", author: "BotBetter", rating: 4.9, installs: 987, enabled: true, pro: false, color: "#3B82F6" },
  { id: "email-reply", name: "Email Reply AI", desc: "Read your emails and generate professional replies in your tone automatically.", icon: "📧", category: "Communication", author: "BotBetter", rating: 4.7, installs: 2341, enabled: false, pro: false, color: "#EA4335" },
  { id: "whatsapp-bulk", name: "WhatsApp Broadcaster", desc: "Send personalized bulk messages to contacts with merge fields support.", icon: "💬", category: "Communication", author: "Community", rating: 4.5, installs: 456, enabled: false, pro: true, color: "#25D366" },
  { id: "content-gen", name: "Content Generator", desc: "Generate Instagram captions, LinkedIn posts, tweets with a single prompt.", icon: "✍️", category: "Social", author: "BotBetter", rating: 4.6, installs: 1876, enabled: false, pro: false, color: "#DD2A7B" },
  { id: "budget-tracker", name: "Budget Tracker", desc: "Track spending, set limits, and get weekly financial summaries via WhatsApp.", icon: "💰", category: "Finance", author: "Community", rating: 4.4, installs: 312, enabled: false, pro: true, color: "#F59E0B" },
  { id: "code-reviewer", name: "Code Reviewer", desc: "Paste code to get instant review, refactor suggestions, and bug detection.", icon: "💻", category: "Developer", author: "BotBetter", rating: 4.9, installs: 678, enabled: false, pro: true, color: "#10B981" },
  { id: "news-digest", name: "Daily News Digest", desc: "Get personalized news summary every morning via WhatsApp or email.", icon: "📰", category: "Information", author: "Community", rating: 4.3, installs: 234, enabled: false, pro: false, color: "#6366F1" },
  { id: "language-tutor", name: "Language Tutor", desc: "Practice Hindi, Urdu, or any Indian language with AI conversation exercises.", icon: "🌐", category: "Education", author: "BotBetter", rating: 4.7, installs: 890, enabled: false, pro: false, color: "#8B5CF6" },
];

const CATEGORIES = ["All", "Productivity", "Communication", "Social", "Finance", "Developer", "Information", "Education"];

export const Plugins = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQ, setSearchQ] = useState("");

  const toggle = (id: string) =>
    setPlugins((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));

  const filtered = plugins.filter((p) =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (!searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.desc.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const enabledCount = plugins.filter((p) => p.enabled).length;

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Plugins">
      <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Puzzle className="h-6 w-6 text-primary" /> Plugin Store
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Extend Nexus with powerful plugins · {enabledCount} active
            </p>
          </div>
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-primary/25 text-primary bg-primary/5 hover:bg-primary/10 transition"
          >
            <Zap className="h-4 w-4" /> Submit Plugin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Plugins", value: PLUGINS.length.toString() },
            { label: "Active", value: enabledCount.toString() },
            { label: "Community", value: PLUGINS.filter((p) => p.author === "Community").length.toString() },
          ].map((s) => (
            <div key={s.label} className="bento-card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs font-semibold text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Category filter */}
        <div className="space-y-3">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search plugins…"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium outline-none focus:border-primary transition"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0"
                style={{
                  background: activeCategory === cat ? "linear-gradient(135deg,#6C00FF,#FF3CAC)" : "hsl(var(--card))",
                  color: activeCategory === cat ? "#fff" : "hsl(var(--muted-foreground))",
                  border: activeCategory === cat ? "none" : "1px solid hsl(var(--border))",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Plugin grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((plugin) => (
            <div key={plugin.id} className={`bento-card p-5 flex flex-col gap-4 ${plugin.enabled ? "border-primary/30 bg-primary/[0.03]" : ""}`}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-xl text-2xl grid place-items-center shrink-0"
                    style={{ background: plugin.color + "18", border: `1px solid ${plugin.color}28` }}
                  >
                    {plugin.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{plugin.name}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground">{plugin.author}</div>
                  </div>
                </div>
                {plugin.pro && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-amber-400 border border-amber-400/30 bg-amber-400/10">PRO</span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground font-medium leading-relaxed flex-1">{plugin.desc}</p>

              {/* Meta */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {plugin.rating}</span>
                <span>{plugin.installs.toLocaleString()} installs</span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{plugin.category}</span>
              </div>

              {/* Toggle */}
              <button
                onClick={() => { if (!plugin.pro) toggle(plugin.id); }}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
                style={
                  plugin.enabled
                    ? { background:"rgba(16,185,129,0.1)", color:"#10B981", border:"1px solid rgba(16,185,129,0.25)" }
                    : plugin.pro
                    ? { background:"rgba(245,158,11,0.05)", color:"#F59E0B", border:"1px solid rgba(245,158,11,0.2)", cursor:"not-allowed" }
                    : { background:"hsl(var(--card))", color:"hsl(var(--muted-foreground))", border:"1px solid hsl(var(--border))" }
                }
              >
                {plugin.enabled ? (
                  <><Check className="h-3.5 w-3.5" /> Enabled</>
                ) : plugin.pro ? (
                  <><Lock className="h-3.5 w-3.5" /> Pro Plan</>
                ) : (
                  <><ExternalLink className="h-3.5 w-3.5" /> Enable</>
                )}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bento-card p-12 text-center text-muted-foreground font-medium">
            No plugins found for "{searchQ}"
          </div>
        )}

      </div>
    </DashShell>
  );
};
