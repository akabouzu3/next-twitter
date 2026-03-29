"use server";

import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
// import { revalidatePath } from "next/cache";

export async function unfollowUserAction(targetUserId: string) {
  const currentUserId = await getCurrentSessionUserId();

  if (!currentUserId) {
    throw new Error("ログインが必要です。");
  }

  if (currentUserId === targetUserId) {
    throw new Error("自分自身はアンフォローできません。");
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  // revalidatePath("/app");
  // revalidatePath("/app/connect_people");
}