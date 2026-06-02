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
  Cracky: [
    "Create personalized study plans for NEET, JEE, UPSC, CA, GATE, SSC, Banking",
    "Practice MCQs with instant Hinglish explanations and concept revision",
    "Identify weak chapters from test scores and target them first",
    "Track daily study streak, completed topics, and score history",
    "Generate topic-wise mock tests and predict exam score",
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
  Cracky: [
    { from: "user", text: "NEET 2025 ke liye 6 months bacha hai — full plan batao" },
    { from: "bot", text: "NEET 2025 — 6 months mein crack karo! 🎯\n\nCutoff target: 720 mein 550+ ✅\n\n📊 Subject priority:\n• Biology (90q) — most scoring, aim 80+\n• Chemistry (45q) — Organic + P-block focus\n• Physics (45q) — Mechanics + Thermodynamics\n\n🗓️ 6-Month Roadmap:\n📅 Month 1-2: NCERT + concepts complete\n📅 Month 3-4: Previous year papers (2015-2024)\n📅 Month 5: Daily mock tests\n📅 Month 6: Weak topics revision\n\nWeak chapter scan karein?" },
    { from: "user", text: "Organic Chemistry confusing hai" },
    { from: "bot", text: "Organic clear kar deta hoon! 🧪\n\nNEET ke top 5 Organic topics:\n1️⃣ Named reactions — 30+ syllabus mein hain\n2️⃣ Reaction mechanisms — SN1, SN2, E1, E2\n3️⃣ Functional group tests\n4️⃣ Stereochemistry basics\n5️⃣ Polymers & Biomolecules\n\n💡 Daily 30 min Organic = 8-10 marks guaranteed!\n\nNamed reactions se start karein? Main flashcards + 10 MCQ bhejta hoon 📚" },
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

type Connector = {
  name: string;
  Icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  category: string;
};

const ALL_CONNECTORS: Connector[] = [
  { name: "Gmail", Icon: Mail, color: "#EA4335", category: "productivity" },
  { name: "Google Calendar", Icon: Calendar, color: "#1967D2", category: "productivity" },
  { name: "Google Drive", Icon: HardDrive, color: "#0F9D58", category: "productivity" },
  { name: "Notion", Icon: FileText, color: "#888", category: "productivity" },
  { name: "Slack", Icon: Slack, color: "#E01E5A", category: "productivity" },
  { name: "Microsoft Teams", Icon: Users, color: "#6264A7", category: "productivity" },
  { name: "Instagram DM", Icon: Camera, color: "#E1306C", category: "social" },
  { name: "Twitter / X", Icon: Twitter, color: "#1DA1F2", category: "social" },
  { name: "LinkedIn", Icon: Linkedin, color: "#0A66C2", category: "social" },
  { name: "YouTube", Icon: Youtube, color: "#FF0000", category: "social" },
  { name: "Shopify", Icon: ShoppingBag, color: "#96BF48", category: "ecommerce" },
  { name: "WooCommerce", Icon: ShoppingCart, color: "#7F54B3", category: "ecommerce" },
  { name: "Meesho", Icon: Tag, color: "#F43397", category: "ecommerce" },
  { name: "Amazon Seller", Icon: Package, color: "#FF9900", category: "ecommerce" },
  { name: "WhatsApp Business", Icon: MessageSquare, color: "#25D366", category: "communication" },
  { name: "Telegram", Icon: Send, color: "#2AABEE", category: "communication" },
  { name: "Discord", Icon: MessageCircle, color: "#5865F2", category: "communication" },
  { name: "Canva", Icon: Palette, color: "#00C4CC", category: "creative" },
  { name: "Figma", Icon: Globe, color: "#A259FF", category: "creative" },
  { name: "Adobe Express", Icon: Zap, color: "#FF0000", category: "creative" },
  { name: "Razorpay", Icon: CreditCard, color: "#3395FF", category: "business" },
  { name: "Stripe", Icon: CreditCard, color: "#635BFF", category: "business" },
  { name: "Zoho CRM", Icon: Users, color: "#E42527", category: "business" },
  { name: "HubSpot", Icon: BarChart2, color: "#FF7A59", category: "business" },
  { name: "GitHub", Icon: Github, color: "#888", category: "developer" },
  { name: "Vercel", Icon: Globe, color: "#aaa", category: "developer" },
  { name: "Railway", Icon: Server, color: "#aaa", category: "developer" },
  { name: "Webhook", Icon: Link2, color: "#7C6BFF", category: "developer" },
  { name: "REST API", Icon: Code2, color: "#7C6BFF", category: "developer" },
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
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-white border-2 border-slate-100 rounded-3xl">
        <div className="px-8 pt-8 pb-6 border-b-2 border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Connectors</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Connect your tools to supercharge your agent
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 grid place-items-center rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH CONNECTORS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold tracking-widest text-slate-900 outline-none focus:border-[#6C00FF] transition-colors shadow-sm placeholder:text-slate-400 placeholder:font-bold"
            />
          </div>
        </div>

        <div className="px-8 py-4 border-b-2 border-slate-100 bg-white overflow-x-auto scrollbar-thin">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-[#6C00FF] text-white shadow-md"
                    : "border-2 border-slate-200 text-slate-500 hover:border-[#6C00FF] hover:text-[#6C00FF]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white overflow-y-auto max-h-[500px] scrollbar-thin">
          {filtered.length === 0 ? (
             <div className="text-center py-16 text-slate-500 font-bold tracking-widest uppercase text-sm">
              No connectors found for "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map(({ name, Icon, color }) => (
                <div
                  key={name}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-100 bg-white hover:-translate-y-1 hover:shadow-md transition-all text-center gap-3"
                  style={{ hover: { borderColor: `${color}50` } } as any}
                >
                  <div
                    className="h-14 w-14 rounded-2xl grid place-items-center shrink-0 shadow-sm"
                    style={{ background: `${color}15`, border: `2px solid ${color}30` }}
                  >
                    <Icon className="h-6 w-6" style={{ color }} />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{name}</div>
                  <button
                    className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg transition-colors mt-1"
                    style={{ background: `${color}10`, color: color }}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
      onNavigate("chat");
    } else {
      onChatWithAgent(agentIdx);
    }
  };

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Agent Detail">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Agent picker */}
        <div className="flex flex-wrap gap-2">
          {agents.map((x, i) => (
            <button
              key={x.name}
              onClick={() => setAgentIdx(i)}
              className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 transition-all ${
                i === agentIdx
                  ? "bg-[#6C00FF] text-white border-[#6C00FF] shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              <span className="text-base">{x.emoji}</span> {x.name}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="bento-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute top-0 left-0 bottom-0 w-2" style={{ backgroundColor: a.color }} />
          <div className="flex flex-wrap items-start justify-between gap-6 pl-4">
            <div className="flex items-center gap-6">
              <div
                className="h-20 w-20 rounded-3xl grid place-items-center text-4xl shadow-md"
                style={{ background: `${a.color}15`, border: `2px solid ${a.color}30` }}
              >
                {a.emoji}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-slate-900">{a.name}</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">{a.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Connect to App <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleChatNow}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                style={{ background: a.color }}
              >
                Chat Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-base font-medium text-slate-600 mt-6 pl-4 leading-relaxed max-w-3xl">{a.desc}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Capabilities */}
          <div className="bento-card p-8">
            <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">CAPABILITIES</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">What {a.name} can do</h3>
            <ul className="space-y-4">
              {caps.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <span
                    className="h-6 w-6 rounded-lg grid place-items-center shrink-0 mt-0.5"
                    style={{ background: `${a.color}15`, color: a.color }}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connectors */}
          <div className="bento-card p-8 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">CONNECTORS</div>
                <h3 className="text-2xl font-bold text-slate-900">Connect {a.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-2">
                  30+ integrations — WhatsApp, Gmail, Slack, Shopify, GitHub and more.
                </p>
              </div>
              <button
                onClick={() => setConnectorModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5 shrink-0"
                style={{ background: "#6C00FF" }}
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              {[
                { name: "WhatsApp", Icon: MessageSquare, color: "#25D366" },
                { name: "Gmail", Icon: Mail, color: "#EA4335" },
                { name: "Telegram", Icon: Send, color: "#2AABEE" },
                { name: "Slack", Icon: Slack, color: "#E01E5A" },
                { name: "Canva", Icon: Palette, color: "#00C4CC" },
              ].map(({ name, Icon, color }) => (
                <div
                  key={name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold"
                  style={{ borderColor: `${color}30`, background: `${color}10`, color: color }}
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </div>
              ))}
              <div className="inline-flex items-center px-3 py-1.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-500">
                +25 more
              </div>
            </div>
          </div>
        </div>

        {/* Use With */}
        <div className="bento-card p-8">
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">USE WITH</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Use without opening BotBetter</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 flex gap-5 border-2 border-[#25D366]/20 bg-[#25D366]/5">
              <div className="h-14 w-14 rounded-2xl grid place-items-center shrink-0 bg-[#25D366]/10 border-2 border-[#25D366]/20">
                <MessageSquare className="h-7 w-7 text-[#25D366]" />
              </div>
              <div>
                <div className="font-bold text-lg text-[#25D366]">Use via WhatsApp</div>
                <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">
                  No need to open BotBetter. Just send a command — your agent works in the background and gets it done.
                </p>
                <button className="mt-4 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                  Setup WhatsApp →
                </button>
              </div>
            </div>
            <div className="rounded-2xl p-6 flex gap-5 border-2 border-[#2AABEE]/20 bg-[#2AABEE]/5">
              <div className="h-14 w-14 rounded-2xl grid place-items-center shrink-0 bg-[#2AABEE]/10 border-2 border-[#2AABEE]/20">
                <Send className="h-7 w-7 text-[#2AABEE]" />
              </div>
              <div>
                <div className="font-bold text-lg text-[#2AABEE]">Use via Telegram</div>
                <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">
                  No need to open BotBetter. Just send a command — your agent works in the background and gets it done.
                </p>
                <button className="mt-4 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-xl bg-[#2AABEE]/10 text-[#2AABEE] hover:bg-[#2AABEE]/20 transition-colors">
                  Setup Telegram →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample conversation */}
        <div className="bento-card p-8">
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">SAMPLE CONVERSATION</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-8">See {a.name} in Action</h3>
          <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
            {sample.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white px-5 py-3 text-sm font-medium shadow-sm">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <div
                    className="h-10 w-10 rounded-xl grid place-items-center text-lg shrink-0 shadow-sm"
                    style={{ background: `${a.color}15`, border: `2px solid ${a.color}30` }}
                  >
                    {a.emoji}
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border-2 border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 whitespace-pre-line shadow-sm">
                    {m.text}
                  </div>
                </div>
              )
            )}
          </div>
          <div className="mt-8 pt-6 border-t-2 border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">Ready to try it yourself?</p>
            <button
              onClick={handleChatNow}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all text-white"
              style={{ background: a.color }}
            >
              Start chatting with {a.name} <ArrowRight className="h-4 w-4" />
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
