"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { getCurrentSessionUserId } from "@/lib/auth/session";
import { createPost } from "@/features/post/server/create-post";

export type CreatePostActionState = {
  success: boolean;
  message: string;
  fieldErrors?: {
    content?: string[];
  };
};

const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "投稿内容を入力してください。")
    .max(280, "投稿は280文字以内で入力してください。"),
});

export async function createPostAction(
  _prevState: CreatePostActionState,
  formData: FormData
): Promise<CreatePostActionState> {
  const currentUserId = await getCurrentSessionUserId();

  if (!currentUserId) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }

  const validatedFields = createPostSchema.safeParse({
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { content } = validatedFields.data;

  await createPost({
    userId: currentUserId,
    content,
  });

  revalidatePath("/app");

  return {
    success: true,
    message: "投稿しました。",
  };
}