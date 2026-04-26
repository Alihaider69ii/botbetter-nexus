import { Agent } from "@/data/agents";
import { cn } from "@/lib/utils";

export const AgentCard = ({
  agent,
  active = false,
  onClick,
  className,
}: {
  agent: Agent;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative text-left w-full rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-card/80 transition-all",
      className
    )}
    style={{ borderLeftColor: agent.color, borderLeftWidth: 3 }}
  >
    <div className="flex items-start gap-3">
      <div
        className="h-10 w-10 rounded-lg grid place-items-center text-lg shrink-0"
        style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}40` }}
      >
        {agent.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[14px]">{agent.name}</span>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-emerald-500 pulse-dot" : "bg-muted-foreground/40"
            )}
          />
        </div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{agent.role}</div>
        <p className="text-[13px] text-muted-foreground mt-2 line-clamp-2">{agent.desc}</p>
      </div>
    </div>
  </button>
);
