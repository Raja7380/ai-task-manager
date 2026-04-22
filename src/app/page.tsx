import Link from "next/link";
import { auth } from "@/auth";
import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-20">
      <section className="max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered productivity
        </span>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          Your tasks, with a brain.
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          A tiny, full-stack SaaS built to learn real-world web development:
          Next.js 16, TypeScript, Prisma, NextAuth, OpenAI, Tailwind — the
          exact stack teams ship with in 2026.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Feature
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Task CRUD"
          body="Create, edit, prioritise and complete tasks — backed by a real SQL database."
        />
        <Feature
          icon={<Sparkles className="h-5 w-5" />}
          title="AI summaries"
          body="Ask the app to summarise your week or suggest what to do next."
        />
        <Feature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Real auth"
          body="Email/password + Google OAuth with hashed passwords and JWT sessions."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {icon}
      </div>
      <h3 className="mt-3 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
