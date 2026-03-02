"use server"

import { z } from "zod"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

const schema = z.object({
  email: z.string().email("メール形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上です"),
})

export type LoginActionState = {
	success: boolean;
	errors?: {
		email?: string[],
		password?: string[],
	};
	serverError?: string
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  })

  if (!parsed.success) {
	  const errors = parsed.error.flatten();
	  console.error('loginAction error', errors)

    return {
	    success: false,
      errors: errors.fieldErrors,
      serverError: "メールアドレスまたはパスワードが違います"
    }
  }

  try {
    // redirect したいなら redirectTo を使う（Auth.js v5）
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/home",
    })

    // signIn が redirect を投げる構成ならここには来ない場合もある
    return { 
      success: true
     }

  } catch (err) {
    // 認証失敗などは AuthError で来る
    if (err instanceof AuthError) {
      // CredentialsSignin が多い
      if (err.type === "CredentialsSignin") {
        return { success: false, serverError: "メールアドレスまたはパスワードが違います" }
      }
      return { success: false, serverError: "ログインに失敗しました" }
    }
    // 予期せぬエラー
    return { success: false, serverError: "サーバーエラーが発生しました" }
  }
}