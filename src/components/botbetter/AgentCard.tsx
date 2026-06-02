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
      "group relative text-left w-full bento-card p-5 transition-transform hover:-translate-y-1 hover:border-purple-200",
      className
    )}
  >
    <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-3xl" style={{ backgroundColor: agent.color }} />
    <div className="flex items-start gap-4">
      <div
        className="h-12 w-12 rounded-2xl grid place-items-center text-xl shrink-0 shadow-sm"
        style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
      >
        {agent.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[15px] text-slate-900">{agent.name}</span>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shadow-sm",
              active ? "bg-emerald-500 animate-pulse shadow-emerald-500/50" : "bg-slate-300"
            )}
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{agent.role}</div>
        <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">{agent.desc}</p>
      </div>
    </div>
  </button>
);
