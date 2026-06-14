import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";

type LikePostInput = {
  userId: string;
  postId: string;
};

/**
 * 投稿にいいねする。
 *
 * 同じユーザー/投稿への重複リクエストでも成功扱いにする。
 * PostLike の作成に成功したときだけ、Post.likeCount を増やす。
 */
export async function likePost({ userId, postId }: LikePostInput): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.postLike.create({
        data: {
          userId,
          postId,
        },
      });

      await tx.post.update({
        where: {
          id: postId,
        },
        data: {
          likeCount: {
            increment: 1,
          },
          engagementScore: {
            increment: 3,
          },
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }

    throw error;
  }
}
