import "server-only"
import { cache } from "react"
import { auth } from "@/auth"

export type SessionUser = {
  id: string
}

/**
 * session から現在のログインユーザーを取得する
 * - DBアクセスしない
 * - 未ログインなら null
 */
export const getCurrentSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  return {
    id: session.user.id,
  }
})

/**
 * session から現在ユーザーIDだけ欲しいとき用
 */
export const getCurrentSessionUserId = cache(async (): Promise<string | null> => {
  const user = await getCurrentSessionUser()
  return user?.id ?? null
})