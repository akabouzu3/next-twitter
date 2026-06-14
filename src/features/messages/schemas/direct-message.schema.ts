import { z } from "zod";

/**
 * DM開始フォームの入力境界。
 *
 * `@username` の入力も自然に受け付けるため、先頭の `@` を落としてから
 * DB の username と同じ lowercase の形式へ正規化する。
 */
export const startDirectConversationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "ユーザー名を入力してください。")
    .transform((value) => value.replace(/^@/, "").toLowerCase())
    .refine(
      (value) => /^[a-z0-9_]+$/.test(value),
      "ユーザー名に使える文字は英数字とアンダースコアのみです。",
    ),
});

/**
 * DM送信フォームの入力境界。
 *
 * 画像・添付なしの v1 では本文だけを必須にし、長すぎる投稿を保存前に止める。
 */
export const sendDirectMessageSchema = z.object({
  conversationId: z.string().min(1, "会話を取得できませんでした。"),
  content: z
    .string()
    .trim()
    .min(1, "メッセージを入力してください。")
    .max(1000, "メッセージは1000文字以内で入力してください。"),
});
