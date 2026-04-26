import { ReactNode } from "react";
import { LayoutDashboard, Bot, Compass, Plug, BarChart3, Plus, Settings, LogOut, Sparkles } from "lucide-react";
import { ScreenKey } from "./TopNav";
import { cn } from "@/lib/utils";

export const DashShell = ({
  active,
  onNavigate,
  title,
  user = "Ali — Pro",
  children,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  title: string;
  user?: string;
  children: ReactNode;
}) => {
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
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-6 w-6 rounded-md bg-primary grid place-items-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-medium text-[14px]">BotBetter</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
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
        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg border border-border p-3 bg-card">
            <div className="label-xs text-muted-foreground">PLAN</div>
            <div className="text-[13px] font-medium mt-0.5">Pro — ₹499/mo</div>
            <button className="mt-2 w-full text-[12px] py-1.5 rounded-md bg-primary text-primary-foreground">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between">
          <div>
            <div className="label-xs text-muted-foreground">PAGE</div>
            <div className="text-[14px] font-medium leading-tight">{title}</div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-muted-foreground hidden sm:inline">{user}</span>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-[12px] font-medium">
              A
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">{children}</div>
      </main>
    </div>
  );
};
