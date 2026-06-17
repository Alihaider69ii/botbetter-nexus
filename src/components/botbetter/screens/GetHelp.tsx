import { useState } from "react";
import { DashShell } from "../DashShell";
import { ScreenKey } from "../TopNav";
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail, Bot } from "lucide-react";

const FAQS = [
  {
    q: "How do I connect WhatsApp to Nexus?",
    a: "Go to Connectors → WhatsApp → Connect. You'll receive a QR code to scan with your WhatsApp app. Once connected, Nexus can send and receive messages on your behalf.",
  },
  {
    q: "What is the daily message limit?",
    a: "Free plan: 50 messages/day. Refer friends to earn +20 bonus messages per referral. Starter plan: 500/day. Pro plan: 5000/day.",
  },
  {
    q: "How does voice mode work?",
    a: "Enable voice in Settings or press the mic button in chat. On mobile, you can clap twice to activate voice without opening the keyboard. Nexus supports 11 Indian languages.",
  },
  {
    q: "Can Nexus remember my preferences?",
    a: "Yes! Set a custom behavior prompt in Dashboard → Custom Behavior. Nexus also remembers your language, personality (Maya/Kabir), and voice preferences.",
  },
  {
    q: "What is the difference between Maya and Kabir?",
    a: "Maya is warm, expressive, and conversational — great for everyday tasks. Kabir is direct, professional, and execution-focused — perfect for business tasks.",
  },
  {
    q: "How do webhooks work?",
    a: "Webhooks let external services (like Claude Code or Codex) trigger Nexus tasks. Go to Dashboard → Webhooks to generate your webhook URL and set up triggers.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All conversations are encrypted in transit (HTTPS). We do not sell your data. Chat history is stored per-user and can be deleted at any time.",
  },
  {
    q: "How do I gift Nexus to a friend?",
    a: "Go to Gift Nexus page, enter your friend's email, choose a plan duration, and send. They'll get an activation link. You can also share your referral code for free bonus messages.",
  },
  {
    q: "Can I use Nexus for business?",
    a: "Absolutely! Nexus supports WhatsApp Business, bulk messaging, Google Calendar, Gmail, and custom webhooks for business workflows.",
  },
  {
    q: "What AI models power Nexus?",
    a: "Nexus uses a multi-provider AI system — Gemini, Groq, Mistral, Together AI, and DeepSeek — with automatic failover for 99.9% uptime.",
  },
];

const GUIDES = [
  { title: "Getting Started", icon: "🚀", steps: ["Sign up for free", "Complete onboarding (choose language + personality)", "Start chatting in NexusChat", "Connect your first app (WhatsApp or Gmail)"] },
  { title: "Voice Commands", icon: "🎙️", steps: ["Enable voice in sidebar settings", "Click mic button or clap twice (mobile)", "Speak your request", "Nexus speaks back the answer"] },
  { title: "Multi-Task Mode", icon: "⚡", steps: ["Type a message with multiple tasks: 'send WhatsApp AND ALSO book calendar event'", "Nexus detects tasks automatically", "Watch tasks execute simultaneously in Jarvis overlay", "Results appear in chat"] },
  { title: "Custom Behavior", icon: "🤖", steps: ["Go to Dashboard → Custom Behavior", "Type your instructions for Nexus", "Click Save", "Nexus will follow your instructions in all conversations"] },
];

export const GetHelp = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [chatSent, setChatSent] = useState(false);

  const filtered = FAQS.filter((f) =>
    !searchQ || f.q.toLowerCase().includes(searchQ.toLowerCase()) || f.a.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Get Help">
      <div className="p-4 sm:p-8 space-y-10 max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
            Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">How can we help?</h1>
          <p className="text-muted-foreground font-medium">Search our FAQs or ask Nexus directly</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search FAQs…"
            className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-primary transition placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: MessageCircle, label: "Chat with Nexus", sub: "Get instant AI answers", action: () => onNavigate("chat"), color: "#00D4FF" },
            { icon: Mail, label: "Email Support", sub: "support@botbetter.in", action: () => { window.location.href = "mailto:support@botbetter.in"; }, color: "#6C00FF" },
            { icon: Bot, label: "Community", sub: "Join WhatsApp group", action: () => {}, color: "#25D366" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="bento-card p-5 flex items-center gap-4 hover:-translate-y-1 text-left"
            >
              <div className="h-11 w-11 rounded-xl grid place-items-center shrink-0" style={{ background: item.color + "18", border: `1px solid ${item.color}33` }}>
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Guides */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5">Quick Guides</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {GUIDES.map((g) => (
              <div key={g.title} className="bento-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{g.icon}</span>
                  <h3 className="font-bold text-foreground">{g.title}</h3>
                </div>
                <ol className="space-y-2">
                  {g.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-muted-foreground font-medium">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5">
            {searchQ ? `Results for "${searchQ}" (${filtered.length})` : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bento-card p-8 text-center text-muted-foreground font-medium">
                No results found. <button onClick={() => onNavigate("chat")} className="text-primary underline">Ask Nexus directly →</button>
              </div>
            ) : filtered.map((faq, i) => (
              <div key={i} className="bento-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-sm text-foreground pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-border mb-4" />
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="bento-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Still need help?</h2>
          {chatSent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <div className="font-bold text-foreground">Message sent!</div>
              <div className="text-sm text-muted-foreground mt-1">We'll reply within 24 hours</div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Describe your issue in detail…"
                rows={4}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary transition resize-none"
              />
              <button
                onClick={() => { if (chatMsg.trim()) setChatSent(true); }}
                disabled={!chatMsg.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 text-white transition"
                style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)" }}
              >
                Send Message
              </button>
            </div>
          )}
        </div>

      </div>
    </DashShell>
  );
};
