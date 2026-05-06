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
    name?: string;
    bio?: string;
  };
  fieldErrors?: {
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
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }

  const userId = String(formData.get("userId") ?? "");
  const user = await getUserById(userId);

  if (!user) {
    return {
      success: false,
      message: "編集対象のユーザを取得できませんでした。",
    };
  }

  // 現在のユーザが対象のユーザを編集する権限を持ってるかを確認
  if(!canEditUser(currentUser, user)){
    return {
      success: false,
      message: "このユーザーを編集する権限がありません。",
    };
  };

  // ユーザ編集内容を取得
  const rawName = String(formData.get("name") ?? "");
  const rawBio = String(formData.get("bio") ?? "");
  const rawImageFile = formData.get("image");
  const rawBackgroundImageFile = formData.get("backgroundImage");

  const imageFile = (rawImageFile instanceof File && rawImageFile.size > 0)
    ? rawImageFile
    : null ;
  const backgroundImageFile = (rawBackgroundImageFile instanceof File && rawBackgroundImageFile.size > 0)
    ? rawBackgroundImageFile
    : null ;

  
  const values = {
    name: rawName,
    bio: rawBio,
  };

  // ユーザ編集内容をバリデーション
  const validatedFields = updateUserSchema.safeParse(values);

  // ユーザ編集内容バリデーションエラーがあればエラーを返す
  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      values,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
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
        values,
        fieldErrors: {
          backgroundImage: validationBackgroundImageResult.errors,
        },
      };
    }
  }

  const { name, bio } = validatedFields.data;

  // ユーザを編集
  await updateUser(user.id, {
    name,
    bio,
    image: imageFile,
    backgroundImage: backgroundImageFile,
  });

  // パスを再検証
  revalidatePath("/app");
  revalidatePath(`/users/${user.username}`);

  // 成功した場合は成功メッセージを返す
  return {
    success: true,
    message: "プロフィールを更新しました。",
  };
}