import { useState, useEffect, useCallback, useRef } from "react";
import "./TaskWindow.css";

/* ─── Types ─── */
type TaskStatus = "ANALYZING" | "WORKING" | "DONE";

interface Task {
  id: string;
  name: string;
  icon: string;
  status: TaskStatus;
  progress: number;
  result: string;
  fadingOut: boolean;
}

export interface TaskDef {
  id: string;
  name: string;
  icon: string;
  result: string;
}

const MAX_ACTIVE = 4;

const DEMO_TASKS: TaskDef[] = [
  { id: "t1", name: "Scanning Network", icon: "🛰️", result: "3 vulnerabilities patched" },
  { id: "t2", name: "Compiling Modules", icon: "⚙️", result: "12 modules compiled" },
  { id: "t3", name: "Syncing Database", icon: "🗄️", result: "2.4 GB synced" },
  { id: "t4", name: "Deploying Services", icon: "🚀", result: "All services live" },
  { id: "t5", name: "Running Diagnostics", icon: "🔬", result: "System nominal" },
];

interface TaskWindowProps {
  /** External tasks to run. If omitted, runs built-in demo sequence. */
  tasks?: TaskDef[];
  /** Called when all tasks finish and the heart returns to center. */
  onAllDone?: () => void;
}

export default function TaskWindow({ tasks: externalTasks, onAllDone }: TaskWindowProps = {}) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [queue, setQueue] = useState<TaskDef[]>([]);
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const fadingRef = useRef<Set<string>>(new Set());

  const animateTask = useCallback((id: string) => {
    setTimeout(() => {
      setActiveTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "WORKING" as TaskStatus } : t))
      );

      const interval = setInterval(() => {
        setActiveTasks((prev) =>
          prev.map((t) => {
            if (t.id !== id || t.status === "DONE") return t;
            const next = Math.min(t.progress + 2 + Math.random() * 3, 100);
            if (next >= 100) {
              clearInterval(interval);
              intervalsRef.current.delete(id);
              return { ...t, progress: 100, status: "DONE" as TaskStatus };
            }
            return { ...t, progress: next };
          })
        );
      }, 80);

      intervalsRef.current.set(id, interval);
    }, 800);
  }, []);

  const addTask = useCallback(
    (def: TaskDef) => {
      setActiveTasks((prev) => {
        const activeCount = prev.filter((t) => !t.fadingOut).length;
        if (activeCount >= MAX_ACTIVE) {
          setQueue((q) => [...q, def]);
          return prev;
        }
        const newTask: Task = { ...def, status: "ANALYZING", progress: 0, fadingOut: false };
        setTimeout(() => animateTask(def.id), 0);
        return [...prev, newTask];
      });
    },
    [animateTask]
  );

  /* Fade out completed tasks after 2s, then remove */
  useEffect(() => {
    activeTasks.forEach((t) => {
      if (t.status === "DONE" && !t.fadingOut && !fadingRef.current.has(t.id)) {
        fadingRef.current.add(t.id);
        setTimeout(() => {
          setActiveTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, fadingOut: true } : x)));
          setTimeout(() => {
            setActiveTasks((prev) => {
              const next = prev.filter((x) => x.id !== t.id);
              if (next.length === 0) onAllDone?.();
              return next;
            });
            fadingRef.current.delete(t.id);
          }, 500);
        }, 2000);
      }
    });
  }, [activeTasks, onAllDone]);

  /* Promote from queue when a slot opens */
  useEffect(() => {
    const activeCount = activeTasks.filter((t) => !t.fadingOut).length;
    if (activeCount < MAX_ACTIVE && queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      const newTask: Task = { ...next, status: "ANALYZING", progress: 0, fadingOut: false };
      setActiveTasks((prev) => [...prev, newTask]);
      setTimeout(() => animateTask(next.id), 0);
    }
  }, [activeTasks, queue, animateTask]);

  /* Demo auto-run when no external tasks provided */
  useEffect(() => {
    if (externalTasks) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    DEMO_TASKS.forEach((def, i) => {
      timeouts.push(setTimeout(() => addTask(def), (i + 1) * 1200));
    });
    return () => {
      timeouts.forEach(clearTimeout);
      intervalsRef.current.forEach((v) => clearInterval(v));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Run external tasks when provided */
  useEffect(() => {
    if (!externalTasks) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    externalTasks.forEach((def, i) => {
      timeouts.push(setTimeout(() => addTask(def), i * 300));
    });
    return () => {
      timeouts.forEach(clearTimeout);
      intervalsRef.current.forEach((v) => clearInterval(v));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTasks]);

  /* Layout logic */
  const visible = activeTasks.filter((t) => !t.fadingOut);
  const count = visible.length;

  const heartClass = [
    "tw-heart",
    count === 0 && "tw-heart--center",
    count === 1 && "tw-heart--left",
    count === 2 && "tw-heart--top",
    count === 3 && "tw-heart--corner",
    count >= 4 && "tw-heart--hidden",
  ]
    .filter(Boolean)
    .join(" ");

  const gridClass = [
    "tw-task-grid",
    count === 1 && "tw-grid--single",
    count === 2 && "tw-grid--split",
    count === 3 && "tw-grid--tri",
    count >= 4 && "tw-grid--quad",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="tw-root">
      {/* Arc Reactor */}
      <div className={heartClass}>
        <div className="tw-reactor">
          <div className="tw-reactor__core" />
          <div className="tw-reactor__ring tw-reactor__ring--1" />
          <div className="tw-reactor__ring tw-reactor__ring--2" />
          <div className="tw-reactor__ring tw-reactor__ring--3" />
          <div className="tw-reactor__ring tw-reactor__ring--4" />
          <div className="tw-reactor__glow" />
        </div>
      </div>

      {/* Task Grid */}
      <div className={gridClass}>
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className={`tw-card ${task.fadingOut ? "tw-card--out" : "tw-card--in"} ${
              task.status === "DONE" ? "tw-card--done" : ""
            }`}
          >
            <div className="tw-card__header">
              <span className="tw-card__icon">{task.icon}</span>
              <span className="tw-card__name">{task.name}</span>
              <span className={`tw-badge tw-badge--${task.status.toLowerCase()}`}>
                {task.status}
              </span>
            </div>

            <div className="tw-card__progress-track">
              <div
                className={`tw-card__progress-fill tw-card__progress-fill--${task.status.toLowerCase()}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>

            <div className="tw-card__footer">
              {task.status === "DONE" ? (
                <span className="tw-card__result">✓ Done — {task.result}</span>
              ) : task.status === "ANALYZING" ? (
                <span className="tw-card__status">Initializing analysis…</span>
              ) : (
                <span className="tw-card__status">Processing… {Math.round(task.progress)}%</span>
              )}
            </div>

            {task.status === "WORKING" && <div className="tw-card__scanline" />}
          </div>
        ))}
      </div>

      {/* Queue Badge */}
      {queue.length > 0 && (
        <div className="tw-queue-badge">
          <span className="tw-queue-badge__dot" />
          {queue.length} queued…
        </div>
      )}
    </div>
  );
}
