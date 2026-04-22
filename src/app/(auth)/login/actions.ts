"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (err) {
    // `signIn` throws a special redirect error on success; re-throw it so
    // Next.js can perform the redirect.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof err.digest === "string" &&
      err.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    if (err instanceof AuthError) {
      const msg =
        err.type === "CredentialsSignin"
          ? "Invalid email or password"
          : "Something went wrong. Please try again.";
      redirect(`/login?error=${encodeURIComponent(msg)}`);
    }
    throw err;
  }
}
