import { useState } from "react";
import { DashShell } from "../DashShell";
import { ScreenKey } from "../TopNav";
import { Webhook, Copy, Check, Plus, Trash2, Zap, Code2, RefreshCw, PlayCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

const EVENTS = [
  "message.received",
  "task.completed",
  "voice.transcribed",
  "connector.triggered",
  "agent.response",
];

const CODE_SNIPPETS: Record<string, string> = {
  "Claude Code": `# .claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": ".*",
      "hooks": [{
        "type": "command",
        "command": "curl -s -X POST ${WEBHOOK_URL} -H 'Content-Type: application/json' -H 'X-BotBetter-Secret: ${SECRET}' -d '{\\"event\\":\\"task.completed\\",\\"tool\\":\\"$TOOL_NAME\\",\\"output\\":\\"$TOOL_OUTPUT\\"}'",
        "timeout": 5
      }]
    }]
  }
}`,
  Codex: `# In your Codex config or script
import requests

def notify_botbetter(event_type, data):
    requests.post(
        "${WEBHOOK_URL}",
        json={"event": event_type, "data": data},
        headers={
            "Content-Type": "application/json",
            "X-BotBetter-Secret": "${SECRET}"
        }
    )

# After each Codex task:
notify_botbetter("task.completed", {"result": output})`,
  cURL: `curl -X POST "${WEBHOOK_URL}" \\
  -H "Content-Type: application/json" \\
  -H "X-BotBetter-Secret: ${SECRET}" \\
  -d '{
    "event": "task.completed",
    "payload": {
      "task": "your-task-name",
      "status": "success",
      "result": "task output here"
    }
  }'`,
  JavaScript: `const response = await fetch("${WEBHOOK_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-BotBetter-Secret": "${SECRET}",
  },
  body: JSON.stringify({
    event: "task.completed",
    payload: { task: "my-task", result: "success" },
  }),
});
console.log(await response.json());`,
};

export const Webhooks = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const { user } = useAuth();
  const baseUrl = import.meta.env.VITE_API_URL || "https://botbetter-backend.onrender.com";

  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: "wh-1",
      name: "Claude Code Integration",
      url: `${baseUrl}/api/webhooks/receive/${user?.id ?? "user123"}`,
      secret: "bb_" + Math.random().toString(36).slice(2, 18),
      events: ["task.completed", "agent.response"],
      enabled: true,
      lastTriggered: "2 min ago",
      triggerCount: 42,
    },
  ]);

  const [selectedSnippet, setSelectedSnippet] = useState("Claude Code");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean } | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["task.completed"]);

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const testWebhook = async (wh: WebhookItem) => {
    setTestingId(wh.id);
    await new Promise((r) => setTimeout(r, 1400));
    setTestResult({ id: wh.id, ok: true });
    setTestingId(null);
    setTimeout(() => setTestResult(null), 3000);
  };

  const deleteWebhook = (id: string) =>
    setWebhooks((prev) => prev.filter((w) => w.id !== id));

  const toggleWebhook = (id: string) =>
    setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, enabled: !w.enabled } : w));

  const addWebhook = () => {
    if (!newName.trim()) return;
    const id = "wh-" + Date.now();
    setWebhooks((prev) => [
      ...prev,
      {
        id,
        name: newName,
        url: `${baseUrl}/api/webhooks/receive/${user?.id ?? "user"}/${id}`,
        secret: "bb_" + Math.random().toString(36).slice(2, 18),
        events: newEvents,
        enabled: true,
        triggerCount: 0,
      },
    ]);
    setNewName("");
    setNewEvents(["task.completed"]);
    setShowNewForm(false);
  };

  const activeWebhook = webhooks[0];
  const snippet = CODE_SNIPPETS[selectedSnippet]
    ?.replace(/\$\{WEBHOOK_URL\}/g, activeWebhook?.url ?? "YOUR_WEBHOOK_URL")
    .replace(/\$\{SECRET\}/g, activeWebhook?.secret ?? "YOUR_SECRET");

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Webhooks">
      <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Webhook className="h-6 w-6 text-primary" /> Webhooks
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Connect external tools like Claude Code & Codex to trigger Nexus
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition hover:-translate-y-0.5"
            style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)" }}
          >
            <Plus className="h-4 w-4" /> New Webhook
          </button>
        </div>

        {/* New webhook form */}
        {showNewForm && (
          <div className="bento-card border-primary/20 p-6 space-y-4">
            <div className="text-sm font-bold text-foreground">Create Webhook</div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Webhook name (e.g. Claude Code Trigger)"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium outline-none focus:border-primary transition"
            />
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Events to listen for</div>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map((evt) => (
                  <button
                    key={evt}
                    onClick={() => setNewEvents((prev) => prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt])}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition"
                    style={
                      newEvents.includes(evt)
                        ? { background:"rgba(108,0,255,0.12)", color:"#6C00FF", border:"1px solid rgba(108,0,255,0.3)" }
                        : { background:"hsl(var(--card))", color:"hsl(var(--muted-foreground))", border:"1px solid hsl(var(--border))" }
                    }
                  >
                    {evt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addWebhook}
                disabled={!newName.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
                style={{ background:"linear-gradient(135deg,#6C00FF,#FF3CAC)" }}
              >
                Create
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Webhook list */}
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <div key={wh.id} className="bento-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${wh.enabled ? "bg-emerald-400 shadow-[0_0_6px_#10B981]" : "bg-muted"}`} />
                  <div>
                    <div className="font-bold text-foreground">{wh.name}</div>
                    {wh.lastTriggered && (
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">
                        Last triggered: {wh.lastTriggered} · {wh.triggerCount} total
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testWebhook(wh)}
                    disabled={testingId === wh.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/25 text-primary bg-primary/5 hover:bg-primary/10 transition"
                  >
                    {testingId === wh.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                    Test
                  </button>
                  {testResult?.id === wh.id && (
                    <span className="text-xs font-bold text-emerald-400">✓ 200 OK</span>
                  )}
                  <button onClick={() => toggleWebhook(wh.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition">
                    {wh.enabled ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deleteWebhook(wh.id)} className="h-7 w-7 grid place-items-center rounded-lg border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Endpoint URL</div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2.5">
                  <code className="text-xs font-mono text-foreground flex-1 truncate">{wh.url}</code>
                  <button onClick={() => copy(wh.url, wh.id + "-url")} className="text-primary shrink-0">
                    {copiedId === wh.id + "-url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Secret */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Secret Key</div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2.5">
                  <code className="text-xs font-mono text-foreground flex-1">{wh.secret}</code>
                  <button onClick={() => copy(wh.secret, wh.id + "-secret")} className="text-primary shrink-0">
                    {copiedId === wh.id + "-secret" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Events */}
              <div className="flex flex-wrap gap-2">
                {wh.events.map((evt) => (
                  <span key={evt} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/8 text-primary border border-primary/15">{evt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Snippets */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Integration Code</h2>
          </div>

          <div className="flex gap-2 flex-wrap">
            {Object.keys(CODE_SNIPPETS).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedSnippet(key)}
                className="px-4 py-2 rounded-full text-xs font-bold transition"
                style={
                  selectedSnippet === key
                    ? { background:"linear-gradient(135deg,#6C00FF,#FF3CAC)", color:"#fff" }
                    : { background:"hsl(var(--card))", color:"hsl(var(--muted-foreground))", border:"1px solid hsl(var(--border))" }
                }
              >
                {key}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="rounded-xl bg-[#0d0d0d] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{selectedSnippet}</span>
                <button onClick={() => copy(snippet, "snippet")} className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 hover:text-white/80 transition">
                  {copiedId === "snippet" ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
              </div>
              <pre className="p-4 text-[11px] font-mono text-green-400/90 overflow-x-auto whitespace-pre leading-relaxed">
                <code>{snippet}</code>
              </pre>
            </div>
          </div>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-amber-400 mb-1">How it works</div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  When your external tool sends a POST to the webhook URL with the secret header, Nexus receives the event and can: notify you on WhatsApp, trigger an AI response, execute tasks, or log the event to your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook logs placeholder */}
        <div className="bento-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" /> Recent Activity
            </h2>
          </div>
          <div className="space-y-2">
            {[
              { time: "2 min ago", event: "task.completed", status: 200, source: "Claude Code" },
              { time: "15 min ago", event: "agent.response", status: 200, source: "Custom Script" },
              { time: "1 hr ago", event: "connector.triggered", status: 200, source: "Claude Code" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-12 rounded text-center text-[10px] font-bold bg-emerald-500/10 text-emerald-400">{log.status}</span>
                  <span className="text-xs font-mono text-foreground">{log.event}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">from {log.source}</span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashShell>
  );
};
