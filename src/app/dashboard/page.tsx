import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewTaskForm } from "@/components/new-task-form";
import { TaskList } from "@/components/task-list";
import { AiSummaryCard } from "@/components/ai-summary-card";

export const metadata = { title: "Dashboard · AI Task Manager" };

export default async function DashboardPage() {
  const session = await auth();
  // Middleware + layout both guard this route, but narrow the type for TS.
  if (!session?.user?.id) return null;

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    open: tasks.filter((t) => t.status !== "done").length,
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">
          Hello {session.user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          You have {stats.open} open and {stats.done} completed task
          {stats.done === 1 ? "" : "s"}.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <NewTaskForm />
          <TaskList tasks={tasks} />
        </div>
        <div className="space-y-6">
          <AiSummaryCard
            tasks={tasks.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              dueDate: t.dueDate ? t.dueDate.toISOString() : null,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
