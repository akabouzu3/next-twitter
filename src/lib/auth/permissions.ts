import { UserRole } from "@prisma/client";
import "server-only";

/**
 * =========================================
 * User型（最低限の権限判定に必要な情報）
 * =========================================
 */
type UserLike = {
  id: string;
  role: UserRole;
};

/**
 * =========================================
 * Post型（権限判定に必要な最小構造）
 * =========================================
 */
type PostLike = {
  userId: string;
};

/**
 * =========================================
 * ユーザーが管理者かどうか
 * =========================================
 *
 * - ADMINならすべての操作が可能
 */
export function isAdmin(user: UserLike): boolean {
  return user.role === "ADMIN";
}

/**
 * =========================================
 * 投稿の所有者かどうか
 * =========================================
 *
 * - 投稿を作成したユーザー本人かを判定
 */
export function isPostOwner(
  user: UserLike,
  post: PostLike
): boolean {
  return user.id === post.userId;
}

/**
 * =========================================
 * 投稿を編集できるか
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 投稿の所有者
 */
export function canEditPost(
  user: UserLike,
  post: PostLike
): boolean {
  return isAdmin(user) || isPostOwner(user, post);
}

/**
 * =========================================
 * 投稿を削除できるか
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 投稿の所有者
 *
 * ※ 今回は編集と同じルール
 *   将来的に分ける可能性あり
 */
export function canDeletePost(
  user: UserLike,
  post: PostLike
): boolean {
  return isAdmin(user) || isPostOwner(user, post);
}

/**
 * =========================================
 * 現在ログインユーザーかどうか
 * =========================================
 *
 * - 自分のプロフィールかどうか
 * - UI制御（編集ボタン表示など）で使う
 */
export function isCurrentUser(
  currentUser: UserLike,
  targetUser: UserLike
): boolean {
  return currentUser.id === targetUser.id;
}

/**
 * =========================================
 * ユーザーを編集できるか
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 本人
 *
 * 使用例:
 * - プロフィール編集
 */
export function canEditUser(
  currentUser: UserLike,
  targetUser: UserLike
): boolean {
  return (
    isAdmin(currentUser) ||
    isCurrentUser(currentUser, targetUser)
  );
}

/**
 * =========================================
 * ユーザーを削除できるか
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 本人
 *
 * 使用例:
 * - プロフィール編集
 */
export function canDeleteUser(
  currentUser: UserLike,
  targetUser: UserLike
): boolean {
  return (
    isAdmin(currentUser) ||
    isCurrentUser(currentUser, targetUser)
  );
}