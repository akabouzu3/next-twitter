

// features/user/schemas/user.schema.ts

import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().min(1, "編集対象のユーザーを取得できませんでした。"),
  name: z.string().trim().min(1, "名前を入力してください。").max(50),
  // username の重複は事前検証しても保存までの間に競合し得るため、
  // ここでは形式だけを検証し、DB の unique 制約違反を Action 側で field error に変換する。
  username: z
    .string()
    .trim()
    .min(3, "ユーザー名は3文字以上で入力してください。")
    .max(30, "ユーザー名は30文字以内で入力してください。")
    .transform((value) => value.toLowerCase())
    .refine(
      (value) => /^[a-z0-9_]+$/.test(value),
      "ユーザー名に使える文字は英数字とアンダースコアのみです。",
    ),
  bio: z.string().trim().max(160),
  currentPassword: z.string().max(100, "現在のパスワードは100文字以内で入力してください。"),
  newPassword: z.string().max(100, "新しいパスワードは100文字以内で入力してください。"),
}).superRefine((value, ctx) => {
  if (value.newPassword.length === 0) {
    return;
  }

  if (value.currentPassword.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "現在のパスワードを入力してください。",
      path: ["currentPassword"],
    });
  }

  if (value.newPassword.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "新しいパスワードは8文字以上で入力してください。",
      path: ["newPassword"],
    });
  }
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
