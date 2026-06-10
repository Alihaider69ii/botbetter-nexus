import { useEffect, useState } from "react";
import { DashShell } from "../DashShell";
import { ScreenKey } from "../TopNav";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { userAPI, type LimitStatusResponse } from "@/services/api";
import { useTheme } from "../ThemeProvider";
import { Loader2, MessageSquare, Zap, Calendar, Clock } from "lucide-react";

const MOCK_DAYS = [
  { day: "Mon", messages: 12 },
  { day: "Tue", messages: 28 },
  { day: "Wed", messages: 18 },
  { day: "Thu", messages: 35 },
  { day: "Fri", messages: 22 },
  { day: "Sat", messages: 8 },
  { day: "Sun", messages: 0 },
];

const getTimeUntilReset = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const Usage = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const { theme } = useTheme();
  const isDark = theme !== "genz";

  const [limitStatus, setLimitStatus] = useState<LimitStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetIn, setResetIn] = useState(getTimeUntilReset());

  useEffect(() => {
    userAPI.getLimitStatus()
      .then(setLimitStatus)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setResetIn(getTimeUntilReset()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const messagesUsed = limitStatus?.messagesUsed ?? 0;
  const totalLimit = limitStatus?.totalLimit ?? 50;
  const messagesLeft = limitStatus?.messagesLeft ?? totalLimit;

  const chartData = MOCK_DAYS.map((d, i) =>
    i === MOCK_DAYS.length - 1 ? { ...d, messages: messagesUsed } : d
  );

  const thisMonthTotal = MOCK_DAYS.slice(0, -1).reduce((s, d) => s + d.messages, 0) + messagesUsed;

  const chartText = isDark ? "rgba(224,247,255,0.45)" : "rgba(10,10,15,0.5)";
  const chartGrid = isDark ? "rgba(0,212,255,0.08)" : "rgba(0,0,0,0.06)";
  const barActive = isDark ? "#00D4FF" : "#6C00FF";
  const barPast = isDark ? "rgba(0,212,255,0.3)" : "rgba(108,0,255,0.25)";
  const tooltipBg = isDark ? "rgba(2,5,16,0.96)" : "rgba(255,255,255,0.98)";
  const tooltipBorder = isDark ? "rgba(0,212,255,0.2)" : "rgba(108,0,255,0.2)";
  const tooltipColor = isDark ? "#E0F7FF" : "#0A0A0F";

  const statCards = [
    {
      label: "TODAY",
      value: loading ? null : `${messagesUsed}/${totalLimit}`,
      sub: loading ? "" : `${messagesLeft} remaining`,
      icon: MessageSquare,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "THIS MONTH",
      value: loading ? null : String(thisMonthTotal),
      sub: "total messages",
      icon: Calendar,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
    },
    {
      label: "TOKENS USED",
      value: "—",
      sub: "API tokens",
      icon: Zap,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
    },
    {
      label: "RESETS IN",
      value: resetIn,
      sub: "daily reset",
      icon: Clock,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Usage">
      <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">

        {/* Header */}
        <div>
          <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">OVERVIEW</div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">Your Usage</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest border border-primary/20">
              Beta Free Plan
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bento-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{card.label}</span>
                <div className={`h-8 w-8 rounded-full ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              {loading && card.label === "TODAY"
                ? <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
                : <div className="text-2xl font-bold text-foreground">{card.value ?? "—"}</div>
              }
              <div className="text-xs font-medium text-muted-foreground mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Daily limit progress */}
        {!loading && limitStatus && (
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-foreground">Daily Limit</span>
              <span className="text-sm font-semibold text-muted-foreground">{messagesUsed} / {totalLimit} messages</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (messagesUsed / totalLimit) * 100)}%`,
                  background:
                    messagesLeft / totalLimit > 0.5 ? `linear-gradient(90deg, ${isDark ? "#00D4FF" : "#6C00FF"}, ${isDark ? "#00A8FF" : "#8B3FFF"})`
                    : messagesLeft / totalLimit > 0.25 ? "linear-gradient(90deg, #f59e0b, #f97316)"
                    : "linear-gradient(90deg, #ef4444, #dc2626)",
                  boxShadow: isDark ? "0 0 10px rgba(0,212,255,0.3)" : "0 0 10px rgba(108,0,255,0.2)",
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Resets in {resetIn}</span>
              <span className={messagesLeft > 10 ? "text-emerald-400" : "text-red-400 font-semibold"}>
                {messagesLeft} messages left
              </span>
            </div>
          </div>
        )}

        {/* 7-day chart */}
        <div className="bento-card p-6">
          <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">ACTIVITY</div>
          <h3 className="text-lg font-bold text-foreground mb-6">Last 7 Days</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: chartText, fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartText, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 12,
                    color: tooltipColor,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  cursor={{ fill: isDark ? "rgba(0,212,255,0.05)" : "rgba(108,0,255,0.04)" }}
                  formatter={(v: number) => [`${v} messages`, "Used"]}
                />
                <Bar dataKey="messages" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === chartData.length - 1 ? barActive : barPast}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: barActive }} />
              Today
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: barPast }} />
              Past days
            </div>
          </div>
        </div>

        {/* Plan info */}
        <div className="bento-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">CURRENT PLAN</div>
              <div className="text-2xl font-bold text-foreground">Beta Free</div>
              <p className="text-sm text-muted-foreground mt-1">50 messages/day · Early access perks</p>
            </div>
            <div className="space-y-2 text-sm">
              {[
                "✓  50 messages per day",
                "✓  Nexus AI (Jarvis-style)",
                "✓  Voice mode — Maya / Kabir",
                "✓  Referral bonus messages",
                "✓  All connectors access",
              ].map((f) => (
                <div key={f} className="text-muted-foreground">{f}</div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashShell>
  );
};
