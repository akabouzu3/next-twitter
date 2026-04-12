// get-user.ts

// Server Component / Server Action 専用であることを明示
// クライアントから import されるのを防ぐ
import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@prisma/client";

/**
 * =========================================
 * User Profile 用の select 定義
 * =========================================
 *
 * ・どのフィールドを取得するかを定義
 * ・この定義を元に TypeScript の型も生成する
 * ・UIで使う「最小限のデータ」に絞るのが重要
 */
export const userProfileSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,               // ユーザーID
  name: true,             // 表示名
  username: true,         // @username
  bio: true,              // 自己紹介
  image: true,            // アイコン画像
  backgroundImage: true,  // バナー画像
  createdAt: true,        // アカウント作成日

  // リレーションの件数（フォロワー数など）
  _count: {
    select: {
      followers: true,    // フォロワー数
      following: true,    // フォロー数
      posts: true,        // 投稿数
    },
  },
});

/**
 * =========================================
 * UserProfile 型
 * =========================================
 *
 * ・上の select から自動生成される型
 * ・UIコンポーネントに渡すための型（DTO的な役割）
 *
 * メリット：
 * - selectと完全一致する
 * - 手動で型を書く必要がない
 * - 変更しても自動追従
 */
export type UserProfile = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;

/**
 * =========================================
 * ユーザーをIDで取得
 * =========================================
 *
 * @param userId - ユーザーID
 * @returns UserProfile | null
 *
 * ・ユーザーが存在しない場合は null を返す
 */
export async function getUserById(
  userId: string
): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });
}

/**
 * =========================================
 * ユーザーをusernameで取得
 * =========================================
 *
 * @param username - ユーザー名（@xxx）
 * @returns UserProfile | null
 *
 * ・プロフィールページなどで使用
 */
export async function getUserByUsername(
  username: string
): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { username },
    select: userProfileSelect,
  });
}