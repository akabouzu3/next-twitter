import "server-only";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AuthError, PermissionError } from "@/lib/auth/errors";
import {
  canDeletePost,
  canDeleteUser,
  canEditPost,
  canEditUser,
  isAdmin,
} from "@/lib/auth/permissions";

/**
 * =========================================
 * 権限判定で使う最小限のユーザー型
 * =========================================
 *
 * - id   : 本人確認・所有者判定に使う
 * - role : 管理者判定に使う
 *
 * PrismaのUser型そのものに依存させず、
 * 必要な情報だけ受け取る設計にしている。
 */
type AuthUserLike = {
  id: string;
  role: "USER" | "ADMIN";
};

/**
 * =========================================
 * 権限判定で使う最小限の投稿型
 * =========================================
 *
 * - userId : 投稿の所有者判定に使う
 */
type PostLike = {
  userId: string;
};

/**
 * =========================================
 * セッションユーザー必須ガード
 * =========================================
 *
 * Auth.js の session から取得できるユーザーを確認する。
 *
 * 用途:
 * - 「ログインしているか」だけ確認したい場合
 * - DBから完全なUser情報を取得しなくてもよい処理
 *
 * 未ログインの場合:
 * - AuthError を投げる
 */
export async function requireSessionUser() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    throw new AuthError("ログインが必要です。");
  }

  return sessionUser;
}

/**
 * =========================================
 * 現在ログイン中のユーザー必須ガード
 * =========================================
 *
 * DBから現在のユーザー情報を取得して確認する。
 *
 * 用途:
 * - role を使った権限判定
 * - プロフィール情報が必要な処理
 * - 投稿作成・編集・削除など
 *
 * 未ログイン、またはDB上にユーザーが存在しない場合:
 * - AuthError を投げる
 */
export async function requireCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new AuthError("ログインが必要です。");
  }

  return currentUser;
}

/**
 * =========================================
 * 管理者ユーザー必須ガード
 * =========================================
 *
 * 現在ログイン中のユーザーを取得し、
 * ADMIN でなければ PermissionError を投げる。
 *
 * 用途:
 * - 管理画面
 * - ユーザー削除
 * - 管理者専用操作
 */
export async function requireAdminUser() {
  const currentUser = await requireCurrentUser();

  if (!isAdmin(currentUser)) {
    throw new PermissionError("管理者権限が必要です。");
  }

  return currentUser;
}

/**
 * =========================================
 * 投稿編集権限チェック
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 投稿の所有者
 *
 * 権限がない場合:
 * - PermissionError を投げる
 */
export function assertCanEditPost(
  user: AuthUserLike,
  post: PostLike
) {
  if (!canEditPost(user, post)) {
    throw new PermissionError("この投稿を編集する権限がありません。");
  }
}

/**
 * =========================================
 * 投稿削除権限チェック
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 投稿の所有者
 *
 * 権限がない場合:
 * - PermissionError を投げる
 */
export function assertCanDeletePost(
  user: AuthUserLike,
  post: PostLike
) {
  if (!canDeletePost(user, post)) {
    throw new PermissionError("この投稿を削除する権限がありません。");
  }
}

/**
 * =========================================
 * ユーザー編集権限チェック
 * =========================================
 *
 * 条件:
 * - 管理者
 * - 本人
 *
 * 用途:
 * - プロフィール編集
 * - ユーザー設定変更
 *
 * 権限がない場合:
 * - PermissionError を投げる
 */
export function assertCanEditUser(
  currentUser: AuthUserLike,
  targetUser: AuthUserLike
) {
  if (!canEditUser(currentUser, targetUser)) {
    throw new PermissionError("このユーザーを編集する権限がありません。");
  }
}

/**
 * =========================================
 * ユーザー削除権限チェック
 * =========================================
 *
 * 条件:
 * - 管理者
 *
 * 注意:
 * - 一般ユーザーが自分自身を削除できる仕様にする場合は、
 *   permissions.ts 側の canDeleteUser を変更する。
 *
 * 権限がない場合:
 * - PermissionError を投げる
 */
export function assertCanDeleteUser(
  currentUser: AuthUserLike,
  targetUser: AuthUserLike
) {
  if (!canDeleteUser(currentUser, targetUser)) {
    throw new PermissionError("このユーザーを削除する権限がありません。");
  }
}