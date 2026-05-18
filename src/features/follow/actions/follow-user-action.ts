"use server";

import { getCurrentSessionUserId } from "@/lib/auth/session";
import { followUser } from "../server/follow-user";
// import { revalidatePath } from "next/cache";

export async function followUserAction(targetUserId: string) {
  const currentUserId = await getCurrentSessionUserId();

  // 認証チェック
  if (!currentUserId) {
    throw new Error("ログインが必要です。");
  }

  await followUser({
    currentUserId, 
    targetUserId
  });

  // // 関連画面の再検証
  // revalidatePath("/app");
  // revalidatePath("/connect_people");
}