"use server";

import { getCurrentSessionUserId } from "@/lib/auth/session";
import { unfollowUser } from "@/features/follow/server/unfollow-user";
// import { revalidatePath } from "next/cache";

export async function unfollowUserAction(targetUserId: string) {
  const currentUserId = await getCurrentSessionUserId();

  if (!currentUserId) {
    throw new Error("ログインが必要です。");
  }

  unfollowUser({
    currentUserId, 
    targetUserId
  });

  // revalidatePath("/app");
  // revalidatePath("/app/connect_people");
}