"use server";

import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { loginSchema } from "@/features/auth/schemas/login";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type LoginActionState = {
  success: boolean;
  values?: { email?: string };
  fieldErrors?: { email?: string[]; password?: string[] };
  serverError?: string;
};

function safeRedirectTo(raw: unknown): string {
  const v = typeof raw === "string" ? raw : "";
  // 相対パス（/で始まる）かつ外部サイトではない（//evil.comなど）ものにはredirectする
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return "/app";
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    const errors = parsed.error.flatten();
    return {
      success: false,
      values: { email }, // ✅ email保持
      fieldErrors: errors.fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectTo(formData.get("redirectTo")),
    });

    // signIn が redirect を投げる構成ならここには来ない場合もある
    return { success: true };
  } catch (err) {
    // ✅ これが超重要：redirectは正常系なので握らない
    if (isRedirectError(err)) throw err;

    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return {
          success: false,
          values: { email },
          serverError: "メールアドレスまたはパスワードが違います",
        };
      }
      return {
        success: false,
        values: { email },
        serverError: "ログインに失敗しました",
      };
    }

    console.error(err);
    return {
      success: false,
      values: { email },
      serverError: "サーバーエラーが発生しました",
    };
  }
}
