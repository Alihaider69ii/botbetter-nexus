import { useMemo, useState } from "react";
import { BotBetterShell } from "../BotBetterSidebar";
import { CONNECTORS, type ConnectorCategory } from "../appShellData";
import type { ScreenKey } from "../TopNav";
import { userAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES: ConnectorCategory[] = ["Communication", "Productivity", "Social", "Business", "Creative", "Developer"];

function ConnectorCard({
  app,
  connected,
  onToggle,
  saving,
}: {
  app: (typeof CONNECTORS)[number];
  connected: boolean;
  onToggle: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex min-h-52 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-xl" aria-hidden="true">{app.icon}</div>
        <span className={connected ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-500"}>
          {connected ? "Connected" : "Available"}
        </span>
      </div>
      <div className="mt-4 text-lg font-semibold text-slate-950">{app.name}</div>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{app.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{app.category}</span>
        <button
          type="button"
          onClick={onToggle}
          disabled={saving}
          className={connected ? "rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60" : "rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"}
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}

export const Connections = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const { user, updateUser, logout } = useAuth();
  const [savingId, setSavingId] = useState("");
  const connectedIds = useMemo(() => user?.connectedApps ?? [], [user?.connectedApps]);
  const connected = useMemo(() => CONNECTORS.filter((app) => connectedIds.includes(app.id)), [connectedIds]);
  const available = useMemo(() => CONNECTORS.filter((app) => !connectedIds.includes(app.id)), [connectedIds]);

  const toggle = async (id: string) => {
    const next = connectedIds.includes(id)
      ? connectedIds.filter((item) => item !== id)
      : [...connectedIds, id];
    updateUser({ connectedApps: next });
    setSavingId(id);
    try {
      const res = await userAPI.updateProfile({ connectedApps: next });
      updateUser(res.user);
    } finally {
      setSavingId("");
    }
  };

  return (
    <BotBetterShell active={active} onNavigate={onNavigate} onLogout={logout} title="Connectors">
      <div className="mx-auto max-w-6xl space-y-10 p-4 sm:p-6">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-600">Connected</div>
              <h2 className="text-2xl font-semibold tracking-tight">Active apps</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{connected.length} connected</span>
          </div>
          {connected.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No apps connected yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {connected.map((app) => (
                <ConnectorCard key={app.id} app={app} connected onToggle={() => void toggle(app.id)} saving={savingId === app.id} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Available</div>
            <h2 className="text-2xl font-semibold tracking-tight">Add a connector</h2>
          </div>

          {CATEGORIES.map((category) => {
            const apps = available.filter((app) => app.category === category);
            if (apps.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{category}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {apps.map((app) => (
                    <ConnectorCard key={app.id} app={app} connected={false} onToggle={() => void toggle(app.id)} saving={savingId === app.id} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </BotBetterShell>
  );
};
