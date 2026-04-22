"use client";

import { useTransition } from "react";
import { Check, Trash2, Circle, Clock, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteTask, toggleTaskStatus } from "@/app/dashboard/actions";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        No tasks yet — add your first one above.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const isDone = task.status === "done";

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900",
        isDone && "opacity-60",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => startTransition(() => toggleTaskStatus(task.id))}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          isDone
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700",
        )}
      >
        {isDone && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            isDone && "line-through text-zinc-500",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.status === "in_progress" && (
            <span className="inline-flex items-center gap-1">
              <Circle className="h-3 w-3" />
              In progress
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => startTransition(() => deleteTask(task.id))}
        aria-label="Delete task"
        className="invisible rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 group-hover:visible dark:hover:bg-zinc-800"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    low: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles[priority] ?? styles.medium,
      )}
    >
      {priority === "high" && <AlertTriangle className="h-3 w-3" />}
      {priority}
    </span>
  );
}
