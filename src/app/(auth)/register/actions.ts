"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(80).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerAction(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    redirect(`/register?error=${encodeURIComponent(msg)}`);
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(
      `/register?error=${encodeURIComponent("An account with that email already exists")}`,
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
    },
  });

  // Sign the user in immediately after registering. `redirectTo` tells
  // NextAuth where to send them on success.
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}
