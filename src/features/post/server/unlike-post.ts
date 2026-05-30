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
  // deleteMany は対象が0件でも失敗しないため、解除操作を冪等にできる。
  await prisma.postLike.deleteMany({
    where: {
      userId,
      postId,
    },
  });
}
