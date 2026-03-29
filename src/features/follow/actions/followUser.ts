"use server";

import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
// import { revalidatePath } from "next/cache";

export async function followUserAction(targetUserId: string) {
  const currentUserId = await getCurrentSessionUserId();

  // 認証チェック
  if (!currentUserId) {
    throw new Error("ログインが必要です。");
  }

  // 自分自身はフォロー不可
  if (currentUserId === targetUserId) {
    throw new Error("自分自身はフォローできません。");
  }

  // すでにフォローしてるかチェック
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  if (existing) return;

  await prisma.follow.create({
    data: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  // // 関連画面の再検証
  // revalidatePath("/app");
  // revalidatePath("/app/connect_people");
}