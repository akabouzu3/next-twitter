import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type LikePostInput = {
  userId: string;
  postId: string;
};

/**
 * 投稿にいいねする。
 *
 * upsert を使い、同じユーザー/投稿への重複リクエストでも成功扱いにする。
 */
export async function likePost({ userId, postId }: LikePostInput): Promise<void> {
  // 既にいいね済みでもエラーにせず成功扱いにするため、upsert で冪等にする。
  // upsert の where は一意に1件を特定する必要があるため、userId + postId の複合ユニークキーを使う。
  // update は Prisma の upsert で必須だが、既存レコードは変更しないので空にしている。
  await prisma.postLike.upsert({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
    update: {},
    create: {
      userId,
      postId,
    },
  });
}
