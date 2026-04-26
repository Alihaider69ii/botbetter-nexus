import { useState } from "react";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { MessageSquare, Mail, Calendar, Send, Slack, Instagram, Globe, Smartphone, Copy, Check } from "lucide-react";

type App = {
  name: string;
  icon: any;
  what: string;
  connected: boolean;
};

const initial: App[] = [
  { name: "WhatsApp", icon: MessageSquare, what: "Send + receive messages, automate replies", connected: true },
  { name: "Gmail", icon: Mail, what: "Draft, send and triage emails", connected: true },
  { name: "Google Calendar", icon: Calendar, what: "Create events, find slots, send invites", connected: true },
  { name: "Telegram", icon: Send, what: "Bot replies and group automation", connected: false },
  { name: "Slack", icon: Slack, what: "Notifications and team workflows", connected: false },
  { name: "Instagram DM", icon: Instagram, what: "Auto-reply to comments and DMs", connected: false },
  { name: "Browser extension", icon: Globe, what: "Use Nexus on any website", connected: false },
  { name: "Mobile app", icon: Smartphone, what: "iOS and Android native apps", connected: false },
];

export const Connections = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [apps, setApps] = useState<App[]>(initial);
  const [copied, setCopied] = useState(false);

  const toggle = (name: string) =>
    setApps((a) => a.map((x) => (x.name === name ? { ...x, connected: !x.connected } : x)));

  const copy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const connected = apps.filter((a) => a.connected);
  const available = apps.filter((a) => !a.connected);

  const Card = ({ app }: { app: App }) => (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center">
          <app.icon className="h-4 w-4" />
        </div>
        {app.connected && (
          <span className="inline-flex items-center gap-1 label-xs text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> CONNECTED
          </span>
        )}
      </div>
      <div className="text-[14px] font-medium mt-3">{app.name}</div>
      <p className="text-[12px] text-muted-foreground mt-1 flex-1">{app.what}</p>
      <button
        onClick={() => toggle(app.name)}
        className={`mt-4 text-[12px] py-1.5 rounded-full ${
          app.connected
            ? "border border-border hover:bg-secondary"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {app.connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Connections">
      <div className="p-4 sm:p-6 max-w-6xl space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-xs text-muted-foreground">CONNECTED</div>
              <h3 className="text-lg">Active integrations ({connected.length})</h3>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connected.map((a) => (
              <Card key={a.name} app={a} />
            ))}
          </div>
        </div>

        <div>
          <div className="label-xs text-muted-foreground">AVAILABLE</div>
          <h3 className="text-lg mb-3">Add new connections</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {available.map((a) => (
              <Card key={a.name} app={a} />
            ))}
          </div>
        </div>

        {/* API */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="label-xs text-muted-foreground">DEVELOPER ACCESS</div>
          <h3 className="text-lg mt-1">API + webhooks</h3>
          <p className="text-[13px] text-muted-foreground mt-1">
            Use Nexus and individual agents from your own backend.
          </p>

          <div className="mt-5 space-y-3">
            <div>
              <div className="label-xs text-muted-foreground mb-1.5">API KEY</div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <code className="text-[12px] flex-1 truncate font-mono">bb_live_sk_8f4x...92ab</code>
                <button
                  onClick={() => copy("bb_live_sk_8f4x92ab")}
                  className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md border border-border hover:bg-secondary"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <div className="label-xs text-muted-foreground mb-1.5">WEBHOOK URL</div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <code className="text-[12px] flex-1 truncate font-mono">https://api.botbetter.ai/v1/hooks/u_a1b2</code>
                <button
                  onClick={() => copy("https://api.botbetter.ai/v1/hooks/u_a1b2")}
                  className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md border border-border hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
};
