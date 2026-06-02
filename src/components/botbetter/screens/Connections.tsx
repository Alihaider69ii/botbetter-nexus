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
    <div className="bento-card p-5 flex flex-col hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className={`h-12 w-12 rounded-2xl grid place-items-center ${app.connected ? 'bg-emerald-50' : 'bg-purple-50'}`}>
          <app.icon className={`h-6 w-6 ${app.connected ? 'text-emerald-600' : 'text-purple-600'}`} />
        </div>
        {app.connected && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
          </span>
        )}
      </div>
      <div className="text-lg font-bold text-slate-900 mt-4">{app.name}</div>
      <p className="text-sm font-medium text-slate-500 mt-1 flex-1">{app.what}</p>
      <button
        onClick={() => toggle(app.name)}
        className={`mt-5 text-[11px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all ${
          app.connected
            ? "border-2 border-slate-100 text-slate-600 hover:bg-slate-50"
            : "bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
        }`}
      >
        {app.connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Connections">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">CONNECTED</div>
              <h3 className="text-2xl font-bold text-slate-900">Active Integrations ({connected.length})</h3>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {connected.map((a) => (
              <Card key={a.name} app={a} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">AVAILABLE</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Add New Connections</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {available.map((a) => (
              <Card key={a.name} app={a} />
            ))}
          </div>
        </div>

        {/* API */}
        <div className="bento-card p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-white">
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">DEVELOPER ACCESS</div>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">API & Webhooks</h3>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Use Nexus and individual agents from your own backend programmatically.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">API KEY</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 shadow-sm">
                <code className="text-sm flex-1 truncate font-mono font-bold text-slate-700">bb_live_sk_8f4x...92ab</code>
                <button
                  onClick={() => copy("bb_live_sk_8f4x92ab")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">WEBHOOK URL</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 shadow-sm">
                <code className="text-sm flex-1 truncate font-mono font-bold text-slate-700">https://api.botbetter.ai/v1/hooks/u_a1b2</code>
                <button
                  onClick={() => copy("https://api.botbetter.ai/v1/hooks/u_a1b2")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
};
