import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type CreatePostInput = {
  userId: string;
  content: string;
};

export async function createPost({
  userId,
  content,
}: CreatePostInput) {
  const post = await prisma.post.create({
    data: {
      userId,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
    },
  });

  return post;
}