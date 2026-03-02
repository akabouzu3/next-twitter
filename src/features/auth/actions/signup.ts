"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupSchema } from "../schemas/signup";

export async function signupAction(_: unknown, formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: (formData.get("name") ?? undefined) as string | undefined,
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) return { ok: false, message: "入力が不正です" };

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, message: "既に登録済みです" };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { ok: true };
}