"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";

type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
};

export function AiSummaryCard({ tasks }: { tasks: TaskSummary[] }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runSummary() {
    setSummary(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tasks }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "AI request failed");
          return;
        }
        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <h2 className="text-sm font-medium">AI summary</h2>
      </div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Let an LLM look at your tasks and suggest what to focus on.
      </p>

      <button
        type="button"
        onClick={runSummary}
        disabled={isPending || tasks.length === 0}
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Summarise my tasks
          </>
        )}
      </button>

      {tasks.length === 0 && (
        <p className="mt-3 text-xs text-zinc-500">
          Add a task first, then I can summarise it for you.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-4 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {summary}
        </div>
      )}
    </div>
  );
}
