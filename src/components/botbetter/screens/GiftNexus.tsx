import { useState } from "react";
import { DashShell } from "../DashShell";
import { ScreenKey } from "../TopNav";
import { Gift, Send, Loader2, Check, Copy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PLANS = [
  { id: "free-7", label: "7-Day Pro Trial", price: "₹0", desc: "Gift a week of Nexus Pro", highlight: false },
  { id: "starter-1m", label: "Starter — 1 Month", price: "₹299", desc: "500 msgs/day · All connectors", highlight: false },
  { id: "starter-3m", label: "Starter — 3 Months", price: "₹799", desc: "Best value for 3 months", highlight: true },
  { id: "pro-1m", label: "Pro — 1 Month", price: "₹999", desc: "5000 msgs/day · Webhooks", highlight: false },
];

export const GiftNexus = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free-7");
  const [personalMsg, setPersonalMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  const sendGift = async () => {
    if (!recipientEmail.trim() || !user) return;
    setSending(true);
    // Generate a gift code
    await new Promise((r) => setTimeout(r, 1200));
    const code = "GIFT" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setGiftCode(code);
    setSent(true);
    setSending(false);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(giftCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `${user?.name ?? "I"} ne tumhe BotBetter Nexus gift kiya! 🎁\n\nActivation code: ${giftCode}\n\nIndia ka #1 agentic AI try karo free mein!\nhttps://botbetter.in`
    );
    window.open(`https://wa.me/${recipientEmail.includes("@") ? "" : recipientEmail}?text=${text}`, "_blank");
  };

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Gift Nexus">
      <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3 pt-4">
          <div className="text-6xl">🎁</div>
          <h1 className="text-3xl font-bold text-foreground">Gift Nexus Access</h1>
          <p className="text-muted-foreground font-medium">
            Give the gift of AI to a friend or family member. They'll love it.
          </p>
        </div>

        {sent ? (
          /* SUCCESS STATE */
          <div className="bento-card border-emerald-500/25 bg-emerald-500/5 p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 grid place-items-center mx-auto">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">Gift Sent!</div>
              <div className="text-sm text-muted-foreground mt-1">
                {recipientName || recipientEmail} will receive their activation details
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Gift Code</div>
              <div className="flex items-center gap-3 justify-center">
                <div className="font-mono text-3xl font-bold text-emerald-400 tracking-widest">{giftCode}</div>
                <button
                  onClick={copyCode}
                  className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={shareWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background:"#25D366" }}
              >
                Share on WhatsApp
              </button>
              <button
                onClick={() => { setSent(false); setRecipientEmail(""); setRecipientName(""); setPersonalMsg(""); setGiftCode(""); }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:text-foreground transition"
              >
                Send Another Gift
              </button>
            </div>
          </div>
        ) : (
          /* GIFT FORM */
          <div className="space-y-6">
            {/* Plan selection */}
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Choose Plan</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className="text-left p-4 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: selectedPlan === p.id ? "rgba(108,0,255,0.5)" : "hsl(var(--border))",
                      background: selectedPlan === p.id ? "rgba(108,0,255,0.06)" : "hsl(var(--card))",
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-bold text-sm text-foreground">{p.label}</span>
                      {p.highlight && (
                        <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)" }}>BEST VALUE</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{p.desc}</div>
                    <div className="text-lg font-bold mt-2" style={{ color: selectedPlan === p.id ? "#6C00FF" : "inherit" }}>{p.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient info */}
            <div className="bento-card p-6 space-y-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recipient Details</div>
              <div className="space-y-3">
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Friend's name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary transition"
                />
                <input
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Friend's email or phone number"
                  type="text"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary transition"
                />
                <textarea
                  value={personalMsg}
                  onChange={(e) => setPersonalMsg(e.target.value)}
                  placeholder="Add a personal message… (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary transition resize-none"
                />
              </div>
            </div>

            {/* Preview card */}
            {recipientName && (
              <div className="bento-card border-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5 p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Preview</div>
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">To: {recipientName}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium italic">
                  "{personalMsg || `Hey ${recipientName}! I'm gifting you access to BotBetter Nexus — India's smartest AI. You're going to love it! 🤖✨`}"
                </p>
                <div className="mt-3 text-xs font-semibold text-primary">
                  Plan: {PLANS.find((p) => p.id === selectedPlan)?.label} · {PLANS.find((p) => p.id === selectedPlan)?.price}
                </div>
              </div>
            )}

            <button
              onClick={sendGift}
              disabled={sending || !recipientEmail.trim()}
              className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 transition hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)", boxShadow:"0 8px 24px rgba(108,0,255,0.3)" }}
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {sending ? "Sending gift…" : "Send Gift"}
            </button>
          </div>
        )}

      </div>
    </DashShell>
  );
};
