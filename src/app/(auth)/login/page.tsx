import Link from "next/link";
import { loginAction } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Sign in · AI Task Manager" };

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = params?.callbackUrl ?? "/dashboard";

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to manage your tasks.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {decodeURIComponent(error)}
            </p>
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          <SubmitButton label="Sign in" />
        </form>

        {googleConfigured && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              OR
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <GoogleButton />
          </>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        {...rest}
        className="mt-1 block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
      />
    </label>
  );
}

function GoogleButton() {
  async function signInWithGoogle() {
    "use server";
    const { signIn } = await import("@/auth");
    await signIn("google", { redirectTo: "/dashboard" });
  }
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
      >
        Continue with Google
      </button>
    </form>
  );
}
