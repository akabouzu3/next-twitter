"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSessionUserId } from "@/lib/auth/session";
import { createPost } from "@/features/post/server/create-post";
import { createPostSchema } from "@/features/post/schemas/create-post.schema";
import { validateImageFiles } from "@/lib/upload/validate-image-files";

export type CreatePostActionState = {
  success: boolean;
  message: string;
  submittedAt?: number;
  values?: {
    content?: string;
  };
  fieldErrors?: {
    content?: string[];
    images?: string[];
  };
};


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

  // 投稿内容を取得
  const rawContent = String(formData.get("content") ?? "");
  const rawFiles = formData.getAll("images");
  const imageFiles = rawFiles.filter((file): file is File => {
    return file instanceof File && file.size > 0;
  });

  // 投稿内容をバリデーション
  const validatedFields = createPostSchema.safeParse({
    content: rawContent,
  });

  // 投稿内容バリデーションエラーがあればエラーを返す
  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      values: { content: rawContent },
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { content } = validatedFields.data;

  // 投稿内容が空で画像もない場合はエラーを返す
  if (!content.trim() && imageFiles.length === 0) {
    return {
      success: false,
      message: "本文または画像を追加してください。",
      values: { content },
    };
  }

  // 画像バリデーションを行う
  const validationResult = validateImageFiles(imageFiles, {
    maxCount: 4,
    maxSize: 5 * 1024 * 1024,
  });
  
  // 画像バリデーションエラーがあればエラーを返す
  if (!validationResult.success) {
    return {
      success: false,
      message: validationResult?.message || "不正な画像です。",
      values: { content },
      fieldErrors: { 
        images: validationResult?.errors 
      },
    };
  }

  // 投稿を作成
  await createPost({
    userId: currentUserId,
    content,
    images: imageFiles,
  });

  // パスを再検証
  revalidatePath("/app");

  // 成功した場合は成功メッセージを返す
  return {
    success: true,
    message: "投稿しました。",
    submittedAt: Date.now(),
  };
}