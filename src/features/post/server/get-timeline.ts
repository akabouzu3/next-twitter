// src/features/post/server/getTimeline.ts
import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
import type { FeedItem } from "@/features/post/types/post.types";

export async function getTimeline(): Promise<FeedItem[]> {
  const userId = await getCurrentSessionUserId();

  if (!userId) {
    return [];
  }

  const follows = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = [
    ...new Set([...follows.map((f) => f.followingId), userId]),
  ];

  const posts = await prisma.post.findMany({
    where: {
      userId: {
        in: followingIds,
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      images: {
        select: {
          id: true,
          url: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20,
  });

  const timeline: FeedItem[] = posts.map<FeedItem>((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    user: {
      id: post.user.id,
      name: post.user.name,
      username: post.user.username,
      image: post.user.image,
    },
    images: post.images.map((image) => ({
      id: image.id,
      url: image.url,
    })),
    likeCount: post._count.likes,
  }));

  return timeline;
}
