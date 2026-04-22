// POST /api/ai/summarize
//
// Takes the current user's tasks and returns a short AI-generated summary
// of what to focus on. Gracefully falls back to a local heuristic summary
// if no OPENAI_API_KEY is configured — so the feature still works for anyone
// cloning the repo without an OpenAI account.

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

export const runtime = "nodejs";

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  dueDate: z.string().nullable(),
});

const bodySchema = z.object({
  tasks: z.array(taskSchema).max(100),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { tasks } = parsed;
  if (tasks.length === 0) {
    return NextResponse.json({ summary: "You have no tasks yet. Add one!" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ summary: heuristicSummary(tasks) });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const prompt = buildPrompt(tasks);
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise productivity coach. Respond in 4-6 short bullet points. Focus on what to do next.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.4,
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() ||
      heuristicSummary(tasks);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("OpenAI error", err);
    return NextResponse.json({ summary: heuristicSummary(tasks) });
  }
}

function buildPrompt(tasks: z.infer<typeof taskSchema>[]): string {
  const lines = tasks.map((t, i) => {
    const due = t.dueDate ? ` (due ${new Date(t.dueDate).toDateString()})` : "";
    return `${i + 1}. [${t.priority}] [${t.status}] ${t.title}${due}${
      t.description ? ` — ${t.description}` : ""
    }`;
  });
  return `Here is my current task list:\n\n${lines.join("\n")}\n\nSummarise what I should focus on and which items to tackle first.`;
}

// Dumb but useful fallback so the feature works without an API key.
function heuristicSummary(tasks: z.infer<typeof taskSchema>[]): string {
  const open = tasks.filter((t) => t.status !== "done");
  if (open.length === 0) {
    return "🎉 All tasks are complete. Take a break!";
  }
  const high = open.filter((t) => t.priority === "high");
  const overdue = open.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date(),
  );

  const parts: string[] = [];
  parts.push(
    `• You have ${open.length} open task${open.length === 1 ? "" : "s"} and ${
      tasks.length - open.length
    } completed.`,
  );
  if (high.length) {
    parts.push(
      `• High priority: ${high
        .slice(0, 3)
        .map((t) => t.title)
        .join(", ")}${high.length > 3 ? "…" : ""}.`,
    );
  }
  if (overdue.length) {
    parts.push(
      `• ${overdue.length} item${overdue.length === 1 ? " is" : "s are"} past due — start there.`,
    );
  }
  parts.push(
    "• Tip: add an OPENAI_API_KEY to .env to get a smarter, LLM-generated summary.",
  );
  return parts.join("\n");
}
