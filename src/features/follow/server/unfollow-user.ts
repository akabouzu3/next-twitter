import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type UnfollowUserInput = {
  currentUserId: string;
  targetUserId: string;
};

export async function unfollowUser({
  currentUserId,
  targetUserId,
}: UnfollowUserInput): Promise<void> {

  if (currentUserId === targetUserId) {
    throw new Error("自分自身はアンフォローできません。");
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });
}