import "server-only"
import { redirect } from "next/navigation"
import { getCurrentSessionUser } from "@/lib/auth/session"
import { getCurrentUser } from "@/lib/auth/current-user"

/**
 * ログイン必須
 * - 未ログインなら /login へ
 * - ログイン済みなら session user を返す
 */
export async function requireAuth() {
  const sessionUser = await getCurrentSessionUser()

  if (!sessionUser) {
    redirect("/login")
  }

  return sessionUser
}

/**
 * ゲスト専用
 * - ログイン済みなら /app へ
 * - 未ログインならそのまま続行
 */
export async function requireGuest() {
  const sessionUser = await getCurrentSessionUser()

  if (sessionUser) {
    redirect("/app")
  }
}

/**
 * 管理者専用
 * - 未ログインなら /login
 * - role !== ADMIN なら /403
 * - 管理者なら DB user を返す
 */
export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "ADMIN") {
    redirect("/403")
  }

  return user
}