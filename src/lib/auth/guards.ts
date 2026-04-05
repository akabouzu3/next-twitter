import "server-only";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AuthError, PermissionError } from "@/lib/auth/errors";
import { canDeletePost, canEditPost, isAdmin } from "@/lib/auth/permissions";

export async function requireSessionUser() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    throw new AuthError("ログインが必要です。");
  }

  return sessionUser;
}

export async function requireCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new AuthError("ログインが必要です。");
  }

  return currentUser;
}

export async function requireAdminUser() {
  const currentUser = await requireCurrentUser();

  if (!isAdmin(currentUser)) {
    throw new PermissionError("管理者権限が必要です。");
  }

  return currentUser;
}

export function assertCanEditPost(
  user: { id: string; role: "USER" | "ADMIN" },
  post: { userId: string }
) {
  if (!canEditPost(user, post)) {
    throw new PermissionError("この投稿を編集する権限がありません。");
  }
}

export function assertCanDeletePost(
  user: { id: string; role: "USER" | "ADMIN" },
  post: { userId: string }
) {
  if (!canDeletePost(user, post)) {
    throw new PermissionError("この投稿を削除する権限がありません。");
  }
}