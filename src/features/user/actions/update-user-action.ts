"use server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateUserSchema } from "../schemas/update-user.schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { validateImageFiles } from "@/lib/upload/validate-image-files";
import { updateUser } from "../server/update-user";
import { canEditUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma/prisma";
import {
  IMAGE_UPLOAD_MAX_FILE_SIZE,
  IMAGE_UPLOAD_MAX_TOTAL_SIZE,
} from "@/lib/upload/image-limits";

/**
 * プロフィール編集 Server Action がフォームへ返す状態。
 *
 * `values` はバリデーション失敗時に入力内容を復元するためのもの。
 * パスワード系フィールドは再表示しないため、ここには含めない。
 */
export type UpdateUserActionState = {
  success: boolean;
  message: string;
  submittedAt?: number;
  values?: {
    userId?: string;
    name?: string;
    username?: string;
    bio?: string;
  };
  fieldErrors?: {
    userId?: string[];
    name?: string[];
    username?: string[];
    bio?: string[];
    currentPassword?: string[];
    newPassword?: string[];
    image?: string[];
    backgroundImage?: string[];
  };
};

/**
 * Prisma の一意制約違反が `User.username` 由来かどうかを判定する。
 *
 * username は DB の unique 制約が最終防衛線になるため、事前検索ではなく
 * update 失敗時の P2002 を field error に変換する。
 */
function isUniqueUsernameError(error: unknown) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target = error.meta?.target;

  return Array.isArray(target)
    ? target.includes("username")
    : typeof target === "string" && target.includes("username");
}

/**
 * ログインユーザーがプロフィールを更新する Server Action。
 *
 * 主な責務:
 * - FormData を Zod で検証する
 * - 編集対象と現在ユーザーの権限を確認する
 * - パスワード変更時だけ現在パスワードを検証して hash を作る
 * - 画像ファイルを検証して server 層の更新処理へ渡す
 * - 更新後に関連ページを再検証する
 */
export async function updateUserAction(
  _prevState: UpdateUserActionState,
  formData: FormData
): Promise<UpdateUserActionState> {
  const submittedAt = Date.now();
  const currentUser = await getCurrentUser();

  // Server Action は直接呼ばれ得るため、UI表示に頼らず必ず認証を確認する。
  if (!currentUser) {
    return {
      success: false,
      message: "ログインが必要です。",
      submittedAt,
    };
  }

  /**
   * 入力復元用の値。
   *
   * currentPassword / newPassword は安全のため state に戻さない。
   * バリデーション自体には必要なので、validationValues 側でだけ扱う。
   */
  const values = {
    userId: String(formData.get("userId") ?? ""),
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  };
  const validationValues = {
    ...values,
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  };
  const rawImageFile = formData.get("image");
  const rawBackgroundImageFile = formData.get("backgroundImage");

  // file input は未選択でも File-like な値になり得るため、size で実ファイルだけに絞る。
  const imageFile = rawImageFile instanceof File && rawImageFile.size > 0
    ? rawImageFile
    : null;
  const backgroundImageFile =
    rawBackgroundImageFile instanceof File && rawBackgroundImageFile.size > 0
    ? rawBackgroundImageFile
    : null;

  // ユーザー編集内容を入力境界でまとめて検証する。
  const validatedFields = updateUserSchema.safeParse(validationValues);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      submittedAt,
      values,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId, name, username, bio, currentPassword, newPassword } =
    validatedFields.data;

  /**
   * passwordHash は公開プロフィール用 select には含めない値なので、
   * パスワード変更判定を行うこの Action 内で最小限の select に絞って取得する。
   */
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      username: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "編集対象のユーザーを取得できませんでした。",
      submittedAt,
      values,
    };
  }

  // 管理者または本人以外は更新できない。
  if (!canEditUser(currentUser, user)) {
    return {
      success: false,
      message: "このユーザーを編集する権限がありません。",
      submittedAt,
      values,
    };
  }

  let nextPasswordHash: string | undefined;

  /**
   * パスワードは新しい値が入力された場合だけ変更する。
   *
   * - passwordHash がないアカウントは現在パスワードを照合できないため拒否する
   * - 現在パスワードが一致した場合だけ bcrypt hash を作成して更新へ渡す
   */
  if (newPassword.length > 0) {
    if (!user.passwordHash) {
      return {
        success: false,
        message:
          "このアカウントでは現在のパスワードを確認できないため、プロフィール編集からはパスワードを変更できません。",
        submittedAt,
        values,
        fieldErrors: {
          currentPassword: [
            "このアカウントでは現在のパスワードを確認できません。",
          ],
        },
      };
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: "現在のパスワードを確認してください。",
        submittedAt,
        values,
        fieldErrors: {
          currentPassword: ["現在のパスワードが正しくありません。"],
        },
      };
    }

    nextPasswordHash = await bcrypt.hash(newPassword, 12);
  }

  // プロフィール画像は選択された場合だけ検証する。
  if (imageFile) {
    const validationImageResult = validateImageFiles([imageFile], {
      maxCount: 1,
      maxSize: IMAGE_UPLOAD_MAX_FILE_SIZE,
      maxTotalSize: IMAGE_UPLOAD_MAX_TOTAL_SIZE,
    });

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

  // 背景画像もプロフィール画像と同じ制約で検証する。
  if (backgroundImageFile) {
    const validationBackgroundImageResult = validateImageFiles(
      [backgroundImageFile],
      {
        maxCount: 1,
        maxSize: IMAGE_UPLOAD_MAX_FILE_SIZE,
        maxTotalSize: IMAGE_UPLOAD_MAX_TOTAL_SIZE,
      }
    );

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

  const selectedImageFiles = [imageFile, backgroundImageFile].filter(
    (file): file is File => file !== null,
  );

  const validationTotalImageResult = validateImageFiles(selectedImageFiles, {
    maxCount: 2,
    maxSize: IMAGE_UPLOAD_MAX_FILE_SIZE,
    maxTotalSize: IMAGE_UPLOAD_MAX_TOTAL_SIZE,
  });

  if (!validationTotalImageResult.success) {
    return {
      success: false,
      message: validationTotalImageResult.message,
      submittedAt,
      values,
      fieldErrors: {
        image: validationTotalImageResult.errors,
        backgroundImage: validationTotalImageResult.errors,
      },
    };
  }

  const shouldRedirectToUpdatedProfile = user.username !== username;

  try {
    // DB更新と画像保存の詳細は server 層に委譲し、Action は入力境界と権限を担当する。
    await updateUser(user.id, {
      name,
      username,
      bio,
      passwordHash: nextPasswordHash,
      image: imageFile,
      backgroundImage: backgroundImageFile,
    });

    // username 変更に備えて、旧URLと新URLの両方を再検証する。
    revalidatePath("/app");
    revalidatePath(`/users/${user.username}`, "layout");
    revalidatePath(`/users/${username}`, "layout");
  } catch (error) {
    // DB の unique 制約違反を UI で扱いやすい username field error に変換する。
    if (isUniqueUsernameError(error)) {
      return {
        success: false,
        message: "このユーザー名はすでに使われています。",
        submittedAt,
        values,
        fieldErrors: {
          username: ["このユーザー名はすでに使われています。"],
        },
      };
    }

    console.error("Failed to update user profile", error);

    return {
      success: false,
      message: "プロフィールの更新に失敗しました。時間をおいて再度お試しください。",
      submittedAt,
      values,
    };
  }

  if (shouldRedirectToUpdatedProfile) {
    redirect(`/users/${username}`);
  }

  return {
    success: true,
    message: "プロフィールを更新しました。",
    submittedAt,
  };
}
