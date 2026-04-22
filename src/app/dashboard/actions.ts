"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

const PRIORITIES = ["low", "medium", "high"] as const;
const STATUSES = ["todo", "in_progress", "done"] as const;

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(PRIORITIES).default("medium"),
  dueDate: z.string().optional().or(z.literal("")),
});

export async function createTask(formData: FormData) {
  const userId = await getUserId();
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority") ?? "medium",
    dueDate: formData.get("dueDate") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, description, priority, dueDate } = parsed.data;
  await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Toggle done / status
// ---------------------------------------------------------------------------

export async function toggleTaskStatus(id: string) {
  const userId = await getUserId();
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) return;

  const nextStatus = task.status === "done" ? "todo" : "done";
  await prisma.task.update({
    where: { id },
    data: { status: nextStatus },
  });
  revalidatePath("/dashboard");
}

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(STATUSES),
});

export async function setTaskStatus(formData: FormData) {
  const userId = await getUserId();
  const parsed = updateStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.task.updateMany({
    where: { id: parsed.data.id, userId },
    data: { status: parsed.data.status },
  });
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteTask(id: string) {
  const userId = await getUserId();
  await prisma.task.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
}
