"use server";

import { revalidatePath } from "next/cache";
import { updateUserSchema } from "../schemas/update-user.schema";
import { getUserById } from "../server/get-user";
import { getCurrentUser } from "@/lib/auth/current-user";
import { validateImageFiles } from "@/lib/upload/validate-image-files";
import { updateUser } from "../server/update-user";
import { canEditUser } from "@/lib/auth/permissions";

export type UpdateUserActionState = {
  success: boolean;
  message: string;
  submittedAt?: number;
  values?: {
    userId?: string;
    name?: string;
    bio?: string;
  };
  fieldErrors?: {
    userId?: string[];
    name?: string[];
    bio?: string[];
    image?: string[];
    backgroundImage?: string[];
  };
};


export async function updateUserAction(
  _prevState: UpdateUserActionState,
  formData: FormData
): Promise<UpdateUserActionState> {
  const submittedAt = Date.now();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "ログインが必要です。",
      submittedAt,
    };
  }

  const values = {
    userId: String(formData.get("userId") ?? ""),
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  };
  const rawImageFile = formData.get("image");
  const rawBackgroundImageFile = formData.get("backgroundImage");

  const imageFile = rawImageFile instanceof File && rawImageFile.size > 0
    ? rawImageFile
    : null;
  const backgroundImageFile =
    rawBackgroundImageFile instanceof File && rawBackgroundImageFile.size > 0
    ? rawBackgroundImageFile
    : null;

  // ユーザ編集内容をバリデーション
  const validatedFields = updateUserSchema.safeParse(values);

  // ユーザ編集内容バリデーションエラーがあればエラーを返す
  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      submittedAt,
      values,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId, name, bio } = validatedFields.data;
  const user = await getUserById(userId);

  if (!user) {
    return {
      success: false,
      message: "編集対象のユーザーを取得できませんでした。",
      submittedAt,
      values,
    };
  }

  // 現在のユーザが対象のユーザを編集する権限を持ってるかを確認
  if (!canEditUser(currentUser, user)) {
    return {
      success: false,
      message: "このユーザーを編集する権限がありません。",
      submittedAt,
      values,
    };
  }

  // プロフィール画像バリデーションを行う
  if (imageFile) {
    const validationImageResult = validateImageFiles([imageFile], {
      maxCount: 1,
      maxSize: 5 * 1024 * 1024,
    });

    // プロフィール画像バリデーションエラーがあればエラーを返す
    if (!validationImageResult.success) {
      return {
        success: false,
        message: validationImageResult.message,
        submittedAt,
        values,
        fieldErrors: {
          image: validationImageResult.errors,
        },
      };
    }
  }

  // 背景画像バリデーションを行う
  if (backgroundImageFile) {
    const validationBackgroundImageResult = validateImageFiles(
      [backgroundImageFile],
      {
        maxCount: 1,
        maxSize: 5 * 1024 * 1024,
      }
    );

    // 背景画像バリデーションエラーがあればエラーを返す
    if (!validationBackgroundImageResult.success) {
      return {
        success: false,
        message: validationBackgroundImageResult.message,
        submittedAt,
        values,
        fieldErrors: {
          backgroundImage: validationBackgroundImageResult.errors,
        },
      };
    }
  }

  try {
    // ユーザを編集
    await updateUser(user.id, {
      name,
      bio,
      image: imageFile,
      backgroundImage: backgroundImageFile,
    });

    // パスを再検証
    revalidatePath("/app");
    revalidatePath(`/users/${user.username}`, "layout");
  } catch (error) {
    console.error("Failed to update user profile", error);

    return {
      success: false,
      message: "プロフィールの更新に失敗しました。時間をおいて再度お試しください。",
      submittedAt,
      values,
    };
  }

  // 成功した場合は成功メッセージを返す
  return {
    success: true,
    message: "プロフィールを更新しました。",
    submittedAt,
  };
}
