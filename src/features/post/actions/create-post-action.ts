"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSessionUserId } from "@/lib/auth/session";
import { createPost } from "@/features/post/server/create-post";
import { createPostSchema } from "@/features/post/schemas/create-post.schema";

export type CreatePostActionState = {
  success: boolean;
  message: string;     // 成功 or 失敗のメッセージ
  values?: {
    content?: string;
  };
  fieldErrors?: {
    content?: string[];
  };
};

export async function createPostAction(
  _prevState: CreatePostActionState,
  formData: FormData
): Promise<CreatePostActionState> {

  const currentUserId = await getCurrentSessionUserId();

  // 認可チェック
  if (!currentUserId) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }
  
  // 生のデータを取得
  let content = String(formData.get("content") ?? "");

  // バリデーション
  const validatedFields = createPostSchema.safeParse({
    content,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      values: { content },
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 生のデータをバリデーション済みの値に変換
  ({ content } = validatedFields.data);

  // 投稿作成
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