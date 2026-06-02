import { ReactNode } from "react";
import { LayoutDashboard, Bot, Compass, Plug, BarChart3, Plus, Settings, LogOut, Sparkles } from "lucide-react";
import { ScreenKey } from "./TopNav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export const DashShell = ({
  active,
  onNavigate,
  title,
  children,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  title: string;
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const displayName = user?.name?.split(" ")[0] ?? "You";
  const initial = displayName[0]?.toUpperCase() ?? "U";

  const items: { label: string; icon: any; key?: ScreenKey }[] = [
    { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { label: "My Agents", icon: Bot, key: "agent" },
    { label: "Explore", icon: Compass },
    { label: "Connections", icon: Plug, key: "connections" },
    { label: "Usage", icon: BarChart3 },
    { label: "Create Agent", icon: Plus, key: "create" },
    { label: "Settings", icon: Settings },
    { label: "Logout", icon: LogOut },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] grid place-items-center shadow-md shadow-purple-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[16px] text-slate-900 tracking-tight">BotBetter</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map((it) => {
            const isActive = it.key === active;
            return (
              <button
                key={it.label}
                onClick={() => it.key && onNavigate(it.key)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between">
          <div>
            <div className="label-xs text-muted-foreground">PAGE</div>
            <div className="text-[14px] font-medium leading-tight">{title}</div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-muted-foreground hidden sm:inline">{displayName}</span>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-[12px] font-medium">
              {initial}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">{children}</div>
      </main>
    </div>
  );
};
