import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { BotBetterShell } from "../BotBetterSidebar";
import { CONNECTORS, LANGUAGES } from "../appShellData";
import type { ScreenKey } from "../TopNav";
import { chatAPI, statsAPI, userAPI, type ChatMessage, type LimitStatusResponse, type StatsResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme, type NexusTheme } from "../ThemeProvider";

const emptyStats: StatsResponse["stats"] = {
  plan: "free",
  messagesUsed: 0,
  messagesLeft: 0,
  tokensUsed: 0,
  activeAgents: [],
  connectedApps: [],
  totalChats: 0,
};

function lastSevenDays(history: ChatMessage[]) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
    };
  });

  for (const msg of history) {
    if (msg.role !== "user") continue;
    const key = new Date(msg.createdAt).toISOString().slice(0, 10);
    const day = days.find((d) => d.key === key);
    if (day) day.count += 1;
  }

  return days;
}

export const Dashboard = ({
  active,
  onNavigate,
  onLogout,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  onLogout: () => void;
}) => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState(emptyStats);
  const [limit, setLimit] = useState<LimitStatusResponse | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      statsAPI.getStats(),
      userAPI.getLimitStatus(),
      chatAPI.getHistory("nexus"),
    ]).then(([statsRes, limitRes, historyRes]) => {
      if (cancelled) return;
      if (statsRes.status === "fulfilled") setStats(statsRes.value.stats);
      if (limitRes.status === "fulfilled") setLimit(limitRes.value);
      if (historyRes.status === "fulfilled") setHistory(historyRes.value.history);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const usage = useMemo(() => lastSevenDays(history), [history]);
  const maxUsage = Math.max(1, ...usage.map((d) => d.count));
  const connectedIds = user?.connectedApps ?? stats.connectedApps ?? [];
  const connectedApps = CONNECTORS.filter((app) => connectedIds.includes(app.id));
  const referralCode = limit?.referralCode ?? user?.referralCode ?? "";
  const accountDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available";

  const saveProfile = async (patch: { language?: string; voice?: string; personality?: "maya" | "kabir"; theme?: NexusTheme; connectedApps?: string[] }) => {
    updateUser(patch);
    if (patch.theme) setTheme(patch.theme);
    setSaving(Object.keys(patch)[0] ?? "profile");
    try {
      const res = await userAPI.updateProfile(patch);
      updateUser(res.user);
    } finally {
      setSaving("");
    }
  };

  const setVoicePreference = (value: "maya" | "kabir" | "off") => {
    if (value === "maya") void saveProfile({ voice: "female", personality: "maya" });
    if (value === "kabir") void saveProfile({ voice: "male", personality: "kabir" });
    if (value === "off") void saveProfile({ voice: "off" });
  };

  const copyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const toggleConnector = (id: string) => {
    const next = connectedIds.includes(id)
      ? connectedIds.filter((item) => item !== id)
      : [...connectedIds, id];
    void saveProfile({ connectedApps: next });
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear all Nexus chat history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await chatAPI.clearHistory("nexus");
      setHistory([]);
    } finally {
      setClearing(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your BotBetter account permanently?")) return;
    if (!window.confirm("Final confirmation: this removes your account and history.")) return;
    await userAPI.deleteAccount();
    onLogout();
  };

  const voiceValue = user?.voice === "off" ? "off" : user?.personality === "kabir" || user?.voice === "male" ? "kabir" : "maya";

  return (
    <BotBetterShell active={active} onNavigate={onNavigate} onLogout={onLogout} title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Messages today", value: limit ? `${limit.messagesUsed}/${limit.totalLimit}` : "0/50" },
            { label: "Messages this month", value: String(stats.messagesUsed ?? user?.messagesCount ?? 0) },
            { label: "Tokens used", value: loading ? "..." : stats.tokensUsed.toLocaleString() },
            { label: "Account created", value: accountDate },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Last 7 days message usage</h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
          <div className="flex h-48 items-end gap-3">
            {usage.map((day) => (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-md bg-slate-100">
                  <div
                    className="w-full rounded-md bg-slate-900 transition-all"
                    style={{ height: `${Math.max(8, (day.count / maxUsage) * 100)}%` }}
                    title={`${day.count} messages`}
                  />
                </div>
                <div className="text-xs font-medium text-slate-500">{day.label}</div>
                <div className="text-xs text-slate-400">{day.count}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Account details</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Name</dt><dd className="font-medium">{user?.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Plan</dt><dd className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-bold uppercase text-cyan-700">Beta</dd></div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Referral code</dt>
                <dd className="flex items-center gap-2">
                  <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">{referralCode || "..."}</code>
                  <button className="rounded-md border border-slate-200 p-1.5 hover:bg-slate-50" onClick={copyReferral} aria-label="Copy referral code">
                    <Copy className="h-4 w-4" />
                  </button>
                  {copied && <span className="text-xs font-medium text-emerald-600">Copied</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Referred friends</dt><dd className="font-medium">{limit?.referralCount ?? user?.referralCount ?? 0}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Bonus messages earned</dt><dd className="font-medium">+{limit?.bonusMessages ?? user?.bonusMessages ?? 0}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Language
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2" value={user?.language ?? "en-IN"} onChange={(e) => void saveProfile({ language: e.target.value })}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Voice preference
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2" value={voiceValue} onChange={(e) => setVoicePreference(e.target.value as "maya" | "kabir" | "off")}>
                  <option value="maya">Maya</option>
                  <option value="kabir">Kabir</option>
                  <option value="off">Text only</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Theme
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2" value={theme} onChange={(e) => void saveProfile({ theme: e.target.value as NexusTheme })}>
                  <option value="nexus">Nexus</option>
                  <option value="void">Void</option>
                  <option value="genz">Gen Z</option>
                </select>
              </label>
              <div className="h-5 text-xs font-medium text-slate-500">{saving ? "Saving changes..." : "Changes apply instantly"}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Connected apps</h2>
            <button className="text-sm font-semibold text-slate-700 hover:underline" onClick={() => onNavigate("connections")}>Manage all</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONNECTORS.slice(0, 9).map((app) => {
              const connected = connectedIds.includes(app.id);
              return (
                <div key={app.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-bold">{app.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{app.name}</div>
                    <div className={connected ? "text-xs font-medium text-emerald-600" : "text-xs text-slate-500"}>{connected ? "Connected" : app.category}</div>
                  </div>
                  <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" onClick={() => toggleConnector(app.id)}>
                    {connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50" onClick={clearHistory} disabled={clearing}>
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear chat history
            </button>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={deleteAccount}>
              Delete account
            </button>
          </div>
        </section>
      </div>
    </BotBetterShell>
  );
};
