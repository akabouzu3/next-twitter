import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("メール形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上です"),
})