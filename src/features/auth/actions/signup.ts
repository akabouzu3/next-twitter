"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupSchema } from "../schemas/signup";

export type SignupActionState = {
	success: boolean;
	errors?: {
    name?: string[],
		email?: string[],
		password?: string[],
	};
	serverError?: string
}

function safeRedirectTo(raw: unknown): string {
  const v = typeof raw === "string" ? raw : "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return "/app";
}

export async function signupAction(
  _prevState: SignupActionState, 
  formData: FormData
):Promise<SignupActionState> {
  const parsed = signupSchema.safeParse({
    name: (formData.get("name") ?? undefined) as string | undefined,
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
	  const errors = parsed.error.flatten();
	  console.error('SignupAction error', errors)

    return {
	    success: false,
      errors: errors.fieldErrors,
      serverError: "入力が不正です"
    }
  }

  const { name, email, password } = parsed.data;

  // 既存のユーザーとメールアドレスが被っていいないかのチェック
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false, serverError: "既に登録済みです" };

  // ユーザー作成
  try{
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, passwordHash },
    });

  }catch(e){
    console.error(e);
    // 同時に2リクエストのエラー
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, serverError: "既に登録済みです" };
    }
    // 予期せぬエラー
    return { success: false, serverError: "サーバーエラーが発生しました" }
  }


  // ここで自動ログイン（成功すると redirect を投げて遷移することが多い）
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeRedirectTo(formData.get("redirectTo")),
    });

    // redirect を使わない構成ならここに来ることもある
    return { success: true };
  } catch (e) {
    // Auth.js の signIn 失敗
    if (e instanceof AuthError) {
      return { success: false, serverError: "自動ログインに失敗しました。ログインしてください。" };
    }
    // redirect 例外などは Next.js が処理するので、ここで握りつぶしたくない場合がある
    throw e;
  }

}