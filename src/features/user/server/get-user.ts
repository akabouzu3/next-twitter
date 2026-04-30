// get-user.ts

// Server Component / Server Action 専用であることを明示
// クライアントから import されるのを防ぐ
import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
import { toUserProfileItem } from "@/features/user/server/mappers/mappers";
import { UserProfileItem } from "@/features/user/types/user.types";

/**
 * =========================================
 * User Profile 用の select 定義
 * =========================================
 *
 * ・ユーザー詳細ページで必要なフィールドだけ取得する
 * ・この定義を元に TypeScript の型も生成する
 * ・UIで使う「最小限のデータ」に絞ることで、
 *   不要なカラム取得を防ぎ、型安全に扱える
 */
export const userProfileSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  username: true,
  bio: true,
  image: true,
  backgroundImage: true,
  createdAt: true,

  // リレーションの件数
  _count: {
    select: {
      followers: true, // フォロワー数
      following: true, // フォロー数
      posts: true,     // 投稿数
    },
  },
});

/**
 * =========================================
 * UserProfile 型
 * =========================================
 *
 * ・userProfileSelect から自動生成される型
 * ・UIコンポーネントに渡すプロフィール表示用データ
 *
 * メリット：
 * - select と型が完全に一致する
 * - 手動で型を書く必要がない
 * - select を変更すると型も自動で追従する
 */
export type UserProfile = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;

/**
 * =========================================
 * UserProfileWithFollowStatus 型
 * =========================================
 *
 * ・UserProfile に isFollowing を追加した型
 * ・isFollowing は「現在ログイン中のユーザー」が
 *   このプロフィールユーザーをフォローしているかを表す
 */
export type UserProfileWithFollowStatus = UserProfile & {
  isFollowing: boolean;
};

/**
 * =========================================
 * ユーザーをIDで取得
 * =========================================
 *
 * @param userId - ユーザーID
 * @returns UserProfileWithFollowStatus | null
 *
 * ・ユーザーが存在しない場合は null を返す
 * ・存在する場合はプロフィール情報に isFollowing を付与して返す
 */
export async function getUserById(
  userId: string
): Promise<UserProfileItem | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });

  if (!user) return null;

  const userWithFollowStatus = await addFollowStatus(user);

  return toUserProfileItem(userWithFollowStatus);
}

/**
 * =========================================
 * ユーザーをusernameで取得
 * =========================================
 *
 * @param username - ユーザー名
 * @returns UserProfileWithFollowStatus | null
 *
 * ・プロフィールページなどで使用する
 * ・ユーザーが存在しない場合は null を返す
 * ・存在する場合はプロフィール情報に isFollowing を付与して返す
 */
export async function getUserByUsername(
  username: string
): Promise<UserProfileItem | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: userProfileSelect,
  });

  if (!user) return null;

  const userWithFollowStatus = await addFollowStatus(user);

  return toUserProfileItem(userWithFollowStatus);
}

/**
 * =========================================
 * フォロー状態を追加
 * =========================================
 *
 * @param user - プロフィール表示対象のユーザー
 * @returns UserProfileWithFollowStatus
 *
 * ・現在ログイン中のユーザーを取得する
 * ・未ログインの場合は isFollowing: false
 * ・自分自身のプロフィールの場合も isFollowing: false
 * ・それ以外の場合は Follow テーブルを確認して、
 *   フォロー済みなら true、未フォローなら false を返す
 */
async function addFollowStatus(
  user: UserProfile
): Promise<UserProfileWithFollowStatus> {
  const currentUserId = await getCurrentSessionUserId();

  if (!currentUserId || user.id === currentUserId) {
    return {
      ...user,
      isFollowing: false,
    };
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  return {
    ...user,
    isFollowing: !!follow,
  };
}