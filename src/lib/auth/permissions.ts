// src/lib/auth/permissions.ts
import "server-only"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/current-user"

/**
 * ユーザー本人 or ADMIN のみ許可
 *
 * 用途
 * - プロフィール編集
 * - ユーザー削除
 *
 * 例
 * /users/[id]/edit
 */
export async function requireSelfOrAdmin(targetUserId: string) {

  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const isSelf = user.id === targetUserId
  const isAdmin = user.role === "ADMIN"

  if (!isSelf && !isAdmin) {
    redirect("/403")
  }

  return user
}
