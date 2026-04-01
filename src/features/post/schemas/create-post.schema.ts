import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "投稿内容を入力してください。")
    .max(280, "投稿は280文字以内で入力してください。"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;