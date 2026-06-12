import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type UnlikePostInput = {
  userId: string;
  postId: string;
};

/**
 * 投稿のいいねを解除する。
 *
 * deleteMany により、未いいね状態で呼ばれても成功扱いにする。
 */
export async function unlikePost({
  userId,
  postId,
}: UnlikePostInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // deleteMany は対象が0件でも失敗しないため、解除操作を冪等にできる。
    const result = await tx.postLike.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    if (result.count === 0) {
      return;
    }

    await tx.post.updateMany({
      where: {
        id: postId,
        likeCount: {
          gt: 0,
        },
      },
      data: {
        likeCount: {
          decrement: 1,
        },
        engagementScore: {
          decrement: 3,
        },
      },
    });
  });
}
