// features/user/server/update-user.ts

// Server Component / Server Action 専用であることを明示
import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { saveImage } from "@/lib/upload/save-image";

/**
 * ユーザー更新の入力型
 *
 * - name / bio: 通常フィールド
 * - image / backgroundImage: File（未選択の場合は null）
 */
type Input = {
  name?: string;
  username?: string;
  bio?: string;
  passwordHash?: string;
  image?: File | null;
  backgroundImage?: File | null;
};

/**
 * ユーザー更新処理
 *
 * 流れ：
 * 1. 画像がある場合のみ環境に応じたStorageに保存
 * 2. 保存した画像のURLを生成
 * 3. Prismaでユーザー情報を更新
 *
 * ⚠️ 重要：
 * - 画像未選択の場合は既存の画像を維持する（上書きしない）
 */
export async function updateUser(userId: string, data: Input) {
  /**
   * プロフィール画像のアップロード
   *
   * - Fileが存在し、かつサイズが0より大きい場合のみアップロード
   * - 未選択の場合は undefined にして「更新しない」扱いにする
   */
  const imageUrl =
    data.image && data.image.size > 0
      ? await saveImage(data.image, {
          directory: "users/avatar",
        })
      : undefined;

  /**
   * 背景画像のアップロード
   *
   * - プロフィール画像と同様の条件で処理
   */
  const backgroundImageUrl =
    data.backgroundImage && data.backgroundImage.size > 0
      ? await saveImage(data.backgroundImage, {
          directory: "users/background",
        })
      : undefined;

  /**
   * Prismaでユーザー更新
   *
   * - name / bio はそのまま更新
   * - image / backgroundImage は「値があるときだけ」更新
   *
   * 👉 これをやらないと：
   *    未選択時に null / undefined で上書きされてしまう
   */
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      username: data.username,
      bio: data.bio,

      ...(data.passwordHash !== undefined && {
        passwordHash: data.passwordHash,
      }),

      /**
       * プロフィール画像の条件付き更新
       *
       * imageUrl !== undefined のときだけ
       * → image フィールドを更新
       */
      ...(imageUrl !== undefined && {
        image: imageUrl,
      }),

      /**
       * 背景画像の条件付き更新
       *
       * 同様に、値があるときだけ更新
       */
      ...(backgroundImageUrl !== undefined && {
        backgroundImage: backgroundImageUrl,
      }),
    },
  });
}
