import { useState } from "react";
import { agents } from "@/data/agents";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Check, MessageSquare, Send, Globe, Code2, ArrowRight,
  Mail, Calendar, Slack, Camera, Palette,
  Plus, Search, X,
  HardDrive, FileText, Users, ShoppingBag, ShoppingCart,
  Tag, Package, MessageCircle, Twitter, Linkedin, Youtube,
  Github, Server, Link2, Zap, RefreshCw, GitBranch,
  Target, CreditCard, BarChart2,
} from "lucide-react";

// ── Agent capabilities per agent ──────────────────────────────────────────────

const agentCapabilities: Record<string, string[]> = {
  Nexus: [
    "Route tasks intelligently across all specialist agents",
    "Execute multi-step workflows without manual input",
    "Connect and orchestrate 30+ apps and services",
    "Maintain context across entire conversation history",
    "Schedule recurring tasks and automations",
  ],
  Buddy: [
    "Manage your daily schedule and task list",
    "Draft and send emails on your behalf",
    "Set smart reminders with context awareness",
    "Summarize long documents and threads",
    "Coordinate across WhatsApp, Gmail, and Calendar",
  ],
  Prepify: [
    "Conduct realistic mock interviews (HR + technical)",
    "Give real-time feedback on answers in Hindi/English",
    "Build personalized study plans for any role",
    "Review and optimize resume for ATS systems",
    "Track progress across multiple practice sessions",
  ],
  Sellio: [
    "Generate product titles + descriptions for Meesho/Amazon",
    "Optimize pricing based on competitor data",
    "Draft customer replies in Hindi/English",
    "Track inventory & send restock alerts",
    "Bulk listing CSV export and import",
  ],
  Creato: [
    "Generate reel ideas based on your niche and trends",
    "Write full YouTube scripts with hooks and CTAs",
    "Create caption packs and content calendars",
    "Suggest trending audio and hashtag strategy",
    "Repurpose long-form content into short clips",
  ],
  Finio: [
    "Build monthly budgets tailored to Indian expenses",
    "Explain SIP, ELSS, PPF in simple Hinglish",
    "Calculate tax savings under old vs new regime",
    "Track spending patterns and flag overspending",
    "Suggest best insurance and investment options",
  ],
};

// ── Sample conversations per agent ────────────────────────────────────────────

const agentSamples: Record<string, { from: "user" | "bot"; text: string }[]> = {
  Nexus: [
    { from: "user", text: "Kal presentation hai, client ko proposal bhi bhejna hai aur LinkedIn post bhi" },
    { from: "bot", text: "Got it! Routing 3 tasks simultaneously ⚡\n\n→ Prepify: Presentation practice (5 pitch questions)\n→ Gmail: Proposal draft to client\n→ Creato: LinkedIn post for your product launch\n\nSabka kaam 2 min mein ho jaayega. Continue karein?" },
    { from: "user", text: "Haan, sab karo" },
    { from: "bot", text: "All 3 tasks complete ✅\n\n🎤 Prepify — 5 pitch questions ready. Start practice?\n📧 Gmail — \"Q3 Partnership Proposal\" drafted. Review before send?\n📱 Creato — LinkedIn post with 3 caption options. Which one to post?" },
  ],
  Buddy: [
    { from: "user", text: "Buddy, aaj ke tasks batao aur kal ki meeting ka remind karo" },
    { from: "bot", text: "Aaj ke 3 pending tasks:\n\n✅ Invoice #204 approve — Rohan\n📞 Client call 3 PM — Priya @ Flipkart\n🏋️ Gym 6:30 PM\n\nAur kal 10 AM meeting hai Rahul ke saath — Zomato BKC. Reminder set karoon 9:45 AM pe?" },
    { from: "user", text: "Haan, aur Priya ko confirm email bhi bhejo" },
    { from: "bot", text: "Done! ✅\n\n📌 Reminder set: Kal 9:45 AM\n📧 Email sent to priya@flipkart.com:\n\"Hi Priya, confirming our 3 PM call today. Talk soon!\"\n\nAur kuch chahiye?" },
  ],
  Prepify: [
    { from: "user", text: "Razorpay PM role ke liye interview prep chahiye" },
    { from: "bot", text: "Let's go! 🎯 Razorpay PM interview ke liye ready karta hoon.\n\nPehla question (Behavioral):\n\n\"Tell me about a time you prioritized user needs over engineering constraints. What did you decide and why?\"\n\nSTAR format mein answer karein — main real-time feedback dunga 💬" },
    { from: "user", text: "Hamare payment gateway mein latency issue tha — users drop off kar rahe the. Maine feature release postpone karke pehle infra fix kiya" },
    { from: "bot", text: "Solid answer! 💪 Strengths:\n✅ User-first thinking clearly shown\n✅ Data-backed decision (drop-off = real metric)\n✅ Trade-off acknowledged\n\n💡 Improve karo: Add the result — \"latency 2s se 300ms ho gayi, conversion 18% badha\" — numbers bahut powerful hote hain interviews mein.\n\nNext question?" },
  ],
  Sellio: [
    { from: "user", text: "Cotton printed saree ka title improve karo" },
    { from: "bot", text: "3 SEO-optimized titles ready! 🛍️\n\n1. Premium Cotton Printed Saree | Festive & Daily Wear | Free Size\n2. Ethnic Block Print Cotton Saree | Meesho Bestseller | 5-Star Rated\n3. Handcrafted Cotton Saree | Casual & Party Wear 2024\n\n💡 Title #2 best hai — algorithm \"Bestseller\" wali listings ko zyada boost deta hai." },
    { from: "user", text: "Price kitna rakhu? ₹380 mein padti hai" },
    { from: "bot", text: "Competitors ₹699–₹849 mein bech rahe hain 📊\n\n💡 Recommended: ₹749\n• Net profit after fees: ~₹249\n• ₹750 se neeche = algorithm boost\n• 60%+ conversion rate is range mein\n\nFull competitor analysis karoon?" },
  ],
  Creato: [
    { from: "user", text: "Diwali ke liye fashion reel ideas chahiye" },
    { from: "bot", text: "5 viral Diwali reel ideas 🪔🎬\n\n1. 'Ek dupatta, 5 looks' — transition format\n2. 'Budget vs luxury Diwali outfit' — comparison\n3. 'Thrift to festive queen' — glow-up transformation\n4. 'Saree in 60 seconds' — tutorial format\n5. 'Diwali week outfit diary' — vlog series\n\nKaunsa script banoon?" },
    { from: "user", text: "Pehla wala — script aur shot list" },
    { from: "bot", text: "Script ready! 🎥\n\n🔴 Hook (0–3s): \"Ek dupatta... paanch looks. Let's go ✨\"\n\n📸 Shots:\n• Cape style — slow spin\n• Belt over kurta — beat drop transition\n• Saree drape — dramatic reveal\n• Scarf wrap — mirror POV\n• Classic shoulder — final twirl\n\n🔚 CTA: \"Save karo — Diwali aa rahi hai! 🪔\"\n\n🎵 Trending audio suggest karoon?" },
  ],
  Finio: [
    { from: "user", text: "SIP shuru karni hai ₹5000/month — best option kya hai?" },
    { from: "bot", text: "Top 3 options 📈\n\n🔵 Low risk: Mirae Asset Large Cap — 12% avg\n🟡 Medium risk: Axis Midcap Fund — 15–18% avg\n🟢 Tax saving: Parag Parikh ELSS — ₹18k tax saved + 13% returns\n\nGoal kya hai — wealth build ya tax saving?" },
    { from: "user", text: "Dono chahiye — tax bhi bachana growth bhi" },
    { from: "bot", text: "Best split 💡\n\n₹3,000 → ELSS (Parag Parikh)\n• ₹10,800/year tax saved (30% slab)\n• 3-year lock-in, 13% returns\n\n₹2,000 → Mirae Large Cap\n• Pure growth, no lock-in\n\n🎯 10 saal mein: ₹15.2 Lakhs+ estimated\n\nKYC process shuru karoon?" },
  ],
};

// ── All connectors with categories ────────────────────────────────────────────

type Connector = {
  name: string;
  Icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  category: string;
};

const ALL_CONNECTORS: Connector[] = [
  // Productivity
  { name: "Gmail", Icon: Mail, color: "#EA4335", category: "productivity" },
  { name: "Google Calendar", Icon: Calendar, color: "#1967D2", category: "productivity" },
  { name: "Google Drive", Icon: HardDrive, color: "#0F9D58", category: "productivity" },
  { name: "Notion", Icon: FileText, color: "#888", category: "productivity" },
  { name: "Slack", Icon: Slack, color: "#E01E5A", category: "productivity" },
  { name: "Microsoft Teams", Icon: Users, color: "#6264A7", category: "productivity" },
  // Social
  { name: "Instagram DM", Icon: Camera, color: "#E1306C", category: "social" },
  { name: "Twitter / X", Icon: Twitter, color: "#1DA1F2", category: "social" },
  { name: "LinkedIn", Icon: Linkedin, color: "#0A66C2", category: "social" },
  { name: "YouTube", Icon: Youtube, color: "#FF0000", category: "social" },
  // E-commerce
  { name: "Shopify", Icon: ShoppingBag, color: "#96BF48", category: "ecommerce" },
  { name: "WooCommerce", Icon: ShoppingCart, color: "#7F54B3", category: "ecommerce" },
  { name: "Meesho", Icon: Tag, color: "#F43397", category: "ecommerce" },
  { name: "Amazon Seller", Icon: Package, color: "#FF9900", category: "ecommerce" },
  // Communication
  { name: "WhatsApp Business", Icon: MessageSquare, color: "#25D366", category: "communication" },
  { name: "Telegram", Icon: Send, color: "#2AABEE", category: "communication" },
  { name: "Discord", Icon: MessageCircle, color: "#5865F2", category: "communication" },
  // Creative
  { name: "Canva", Icon: Palette, color: "#00C4CC", category: "creative" },
  { name: "Figma", Icon: Globe, color: "#A259FF", category: "creative" },
  { name: "Adobe Express", Icon: Zap, color: "#FF0000", category: "creative" },
  // Business
  { name: "Razorpay", Icon: CreditCard, color: "#3395FF", category: "business" },
  { name: "Stripe", Icon: CreditCard, color: "#635BFF", category: "business" },
  { name: "Zoho CRM", Icon: Users, color: "#E42527", category: "business" },
  { name: "HubSpot", Icon: BarChart2, color: "#FF7A59", category: "business" },
  // Developer
  { name: "GitHub", Icon: Github, color: "#888", category: "developer" },
  { name: "Vercel", Icon: Globe, color: "#aaa", category: "developer" },
  { name: "Railway", Icon: Server, color: "#aaa", category: "developer" },
  { name: "Webhook", Icon: Link2, color: "#7C6BFF", category: "developer" },
  { name: "REST API", Icon: Code2, color: "#7C6BFF", category: "developer" },
  // AI Tools
  { name: "Vibe Prospecting", Icon: Target, color: "#7C6BFF", category: "ai" },
  { name: "Zapier", Icon: Zap, color: "#FF4A00", category: "ai" },
  { name: "Make.com", Icon: RefreshCw, color: "#6D00CC", category: "ai" },
  { name: "n8n", Icon: GitBranch, color: "#EA4B71", category: "ai" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "productivity", label: "Productivity" },
  { id: "social", label: "Social" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "communication", label: "Communication" },
  { id: "creative", label: "Creative" },
  { id: "business", label: "Business" },
  { id: "developer", label: "Developer" },
  { id: "ai", label: "AI Tools" },
];

// ── ConnectorModal ─────────────────────────────────────────────────────────────

const ConnectorModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = ALL_CONNECTORS.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Modal header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Add Connectors</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Connect your tools to supercharge your agent
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-secondary transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search connectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-[13px] outline-none focus:border-primary/50 transition"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 py-3 border-b border-border overflow-x-auto scrollbar-thin">
          <div className="flex gap-1.5 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Connector grid */}
        <div className="p-5 overflow-y-auto max-h-[400px] scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-[13px]">
              No connectors found for "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(({ name, Icon, color }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/40 transition"
                >
                  <div
                    className="h-9 w-9 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium truncate">{name}</div>
                    <button
                      className="text-[11px] font-semibold transition hover:opacity-80"
                      style={{ color: "#7C6BFF" }}
                    >
                      Connect →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── AgentDetail ────────────────────────────────────────────────────────────────

export const AgentDetail = ({
  active,
  onNavigate,
  onChatWithAgent,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  onChatWithAgent: (agentIdx: number) => void;
}) => {
  const [agentIdx, setAgentIdx] = useState(3); // Sellio
  const [connectorModalOpen, setConnectorModalOpen] = useState(false);
  const a = agents[agentIdx];

  const caps = agentCapabilities[a.name] ?? agentCapabilities.Sellio;
  const sample = agentSamples[a.name] ?? agentSamples.Sellio;

  const handleChatNow = () => {
    if (agentIdx === 0) {
      // Nexus → existing Nexus Chat
      onNavigate("chat");
    } else {
      onChatWithAgent(agentIdx);
    }
  };

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Agent Detail">
      <div className="p-4 sm:p-6 max-w-5xl">
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
            {/* CTA buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-[13px] hover:bg-secondary transition">
                Connect to app <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleChatNow}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition hover:opacity-90"
                style={{ background: "#7C6BFF", color: "white" }}
              >
                Chat Now <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="text-muted-foreground text-[14px] mt-4 max-w-2xl">{a.desc}</p>
        </div>

        {/* Capabilities */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="label-xs text-muted-foreground">CAPABILITIES</div>
          <h3 className="text-lg mt-1 mb-4">What {a.name} can do</h3>
          <ul className="space-y-2">
            {caps.map((c) => (
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
        </div>

        {/* Connectors — collapsed, opens modal */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="label-xs text-muted-foreground">CONNECTORS</div>
              <h3 className="text-base font-medium mt-0.5">Connect {a.name} to your apps</h3>
              <p className="text-[12px] text-muted-foreground mt-1">
                30+ integrations — WhatsApp, Gmail, Slack, Shopify, GitHub and more.
              </p>
            </div>
            <button
              onClick={() => setConnectorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition hover:opacity-90 shrink-0"
              style={{ background: "#7C6BFF", color: "white" }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Connectors
            </button>
          </div>

          {/* Quick preview chips */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {[
              { name: "WhatsApp", Icon: MessageSquare, color: "#25D366" },
              { name: "Gmail", Icon: Mail, color: "#EA4335" },
              { name: "Telegram", Icon: Send, color: "#2AABEE" },
              { name: "Slack", Icon: Slack, color: "#E01E5A" },
              { name: "Canva", Icon: Palette, color: "#00C4CC" },
            ].map(({ name, Icon, color }) => (
              <div
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] text-muted-foreground"
                style={{ borderColor: `${color}35`, background: `${color}08` }}
              >
                <Icon className="h-3 w-3" style={{ color }} />
                {name}
              </div>
            ))}
            <div className="inline-flex items-center px-2.5 py-1 rounded-full border border-border text-[12px] text-muted-foreground">
              +25 more
            </div>
          </div>
        </div>

        {/* Use With */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="label-xs text-muted-foreground mb-1">USE WITH</div>
          <h3 className="text-lg mt-1 mb-4">Use without opening BotBetter</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div
              className="rounded-xl p-5 flex gap-4"
              style={{ background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)" }}
            >
              <div
                className="h-11 w-11 rounded-xl grid place-items-center shrink-0"
                style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.25)" }}
              >
                <MessageSquare className="h-6 w-6" style={{ color: "#25D366" }} />
              </div>
              <div>
                <div className="font-semibold text-[14px]" style={{ color: "#25D366" }}>
                  Use via WhatsApp
                </div>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                  No need to open BotBetter. Just send a command — your agent works in the background and gets it done.
                </p>
                <button
                  className="mt-3 text-[12px] font-semibold px-4 py-1.5 rounded-full transition hover:opacity-90"
                  style={{ background: "rgba(37,211,102,0.15)", color: "#25D366", border: "1px solid rgba(37,211,102,0.3)" }}
                >
                  Setup WhatsApp →
                </button>
              </div>
            </div>

            {/* Telegram */}
            <div
              className="rounded-xl p-5 flex gap-4"
              style={{ background: "rgba(42,171,238,0.05)", border: "1px solid rgba(42,171,238,0.2)" }}
            >
              <div
                className="h-11 w-11 rounded-xl grid place-items-center shrink-0"
                style={{ background: "rgba(42,171,238,0.12)", border: "1px solid rgba(42,171,238,0.25)" }}
              >
                <Send className="h-6 w-6" style={{ color: "#2AABEE" }} />
              </div>
              <div>
                <div className="font-semibold text-[14px]" style={{ color: "#2AABEE" }}>
                  Use via Telegram
                </div>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                  No need to open BotBetter. Just send a command — your agent works in the background and gets it done.
                </p>
                <button
                  className="mt-3 text-[12px] font-semibold px-4 py-1.5 rounded-full transition hover:opacity-90"
                  style={{ background: "rgba(42,171,238,0.15)", color: "#2AABEE", border: "1px solid rgba(42,171,238,0.3)" }}
                >
                  Setup Telegram →
                </button>
              </div>
            </div>
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
                    className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0 mt-0.5"
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

          {/* CTA below sample */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground">
              Ready to try it yourself?
            </p>
            <button
              onClick={handleChatNow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition hover:opacity-90"
              style={{ background: `${a.color}18`, border: `1px solid ${a.color}35`, color: a.color }}
            >
              Start chatting with {a.name} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ConnectorModal
        open={connectorModalOpen}
        onClose={() => setConnectorModalOpen(false)}
      />
    </DashShell>
  );
};
