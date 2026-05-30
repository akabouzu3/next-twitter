import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type Input = {
  userId: string | null;
  postIds: string[];
};

/**
 * 指定ユーザーがいいね済みの投稿ID一覧を Set で返す。
 *
 * フィード1ページ分の投稿IDだけをまとめて調べることで、
 * 投稿ごとの個別クエリを避ける。
 *
 * userId だけで検索すると、そのユーザーが過去にいいねした全投稿が対象になる。
 * 画面表示に必要なのは現在のページ内投稿のいいね状態だけなので、
 * postIds で対象を絞り、取得件数を抑える。
 */
export async function getLikedPostIdSet({
  userId,
  postIds,
}: Input): Promise<Set<string>> {
  if (!userId || postIds.length === 0) {
    return new Set();
  }

  const likes = await prisma.postLike.findMany({
    where: {
      userId,
      postId: {
        in: postIds,
      },
    },
    select: {
      postId: true,
    },
  });

  return new Set(likes.map((like) => like.postId));
}
