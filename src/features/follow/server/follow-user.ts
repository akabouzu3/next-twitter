import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type FollowUserInput = {
  currentUserId: string;
  targetUserId: string;
};

export async function followUser({
  currentUserId,
  targetUserId,
}: FollowUserInput): Promise<void> {

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
}