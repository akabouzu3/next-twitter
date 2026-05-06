"use server";

import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/features/auth/schemas/signup.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type SignupActionState = {
  success: boolean;
  message: string;
  submittedAt?: number;
  values?: { 
    name?: string; 
    email?: string;
  };
  fieldErrors?: { 
    name?: string[]; 
    email?: string[]; 
    password?: string[] 
  };
};

function safeRedirectTo(raw: unknown): string {
  const v = typeof raw === "string" ? raw : "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return "/app";
}

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  // ✅ まずは“生の入力値”を取る（失敗時に values に返すため）
  let name = String(formData.get("name") ?? "");
  let email = String(formData.get("email") ?? "");
  let password = String(formData.get("password") ?? "");

  const parsed = signupSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    const errors = parsed.error.flatten();
    return {
      success: false,
      message: "入力内容を確認してください。",
      values: { name, email }, // ✅ 入力保持（passwordは返さない）
      fieldErrors: errors.fieldErrors,
    };
  }

  // ✅ ここから先は “バリデーション済みの値” だけを使う
  ({ name, email, password } = parsed.data);

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, passwordHash },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message: "既に登録済みです",
        values: { name, email }, // ✅ 入力保持
      };
    }
    return {
      success: false,
      message: "サーバーエラーが発生しました",
      values: { name, email }, // ✅ 入力保持
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeRedirectTo(formData.get("redirectTo")),
    });

    return { 
      success: true, 
      message: "登録が完了しました。",
      submittedAt: Date.now(),
     };
  } catch (e) {
    if (isRedirectError(e)) throw e; // ✅ 成功リダイレクトは正常系
    if (e instanceof AuthError) {
      return {
        success: false,
        message: "自動ログインに失敗しました。ログインしてください。",
        values: { name, email }, // ✅ 失敗しても保持
      };
    }
    throw e;
  }
}
