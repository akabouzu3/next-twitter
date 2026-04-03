"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSessionUserId } from "@/lib/auth/session";
import { createPost } from "@/features/post/server/create-post";
import { createPostSchema } from "@/features/post/schemas/create-post.schema";

export type CreatePostActionState = {
  success: boolean;
  message: string;
  values?: {
    content?: string;
  };
  fieldErrors?: {
    content?: string[];
    images?: string[];
  };
};

const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

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

  const rawContent = String(formData.get("content") ?? "");

  const rawFiles = formData.getAll("images");
  const images = rawFiles.filter((file): file is File => {
    return file instanceof File && file.size > 0;
  });

  const validatedFields = createPostSchema.safeParse({
    content: rawContent,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      values: { content: rawContent },
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { content } = validatedFields.data;

  if (!content.trim() && images.length === 0) {
    return {
      success: false,
      message: "本文または画像を追加してください。",
      values: { content },
      fieldErrors: {
        content: ["本文または画像を追加してください。"],
      },
    };
  }

  if (images.length > MAX_IMAGE_COUNT) {
    return {
      success: false,
      message: "画像は最大4枚までです。",
      values: { content },
      fieldErrors: {
        images: ["画像は最大4枚までです。"],
      },
    };
  }

  for (const image of images) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return {
        success: false,
        message: "対応していない画像形式です。",
        values: { content },
        fieldErrors: {
          images: ["JPEG / PNG / WEBP / GIF のみアップロードできます。"],
        },
      };
    }

    if (image.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        message: "画像サイズが大きすぎます。",
        values: { content },
        fieldErrors: {
          images: ["各画像は5MB以下にしてください。"],
        },
      };
    }
  }

  await createPost({
    userId: currentUserId,
    content,
    images,
  });

  revalidatePath("/app");

  return {
    success: true,
    message: "投稿しました。",
  };
}