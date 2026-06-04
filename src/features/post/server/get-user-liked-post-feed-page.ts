import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { Cursor, FeedItem, FeedPage } from "@/features/post/types/post.types";
import { postFeedItemSelect } from "@/features/post/server/selects/selects";
import {
  createFeedItemOptions,
  createFeedItemOptionsContext,
} from "@/features/post/server/create-feed-item-options";
import { toFeedItem } from "@/features/post/server/mappers/mappers";
import { getCurrentUser } from "@/lib/auth/current-user";

// 1ページあたりの取得件数（無限スクロールの単位）
const PAGE_SIZE = 10;

/**
 * 入力パラメータ
 */
type Input = {
  userId: string;
  limit?: number;
  // 前回の最後の投稿（cursor pagination）
  cursor?: Cursor | null;
};

/**
 * ユーザーのいいねした投稿一覧を取得する
 *
 * - PostLike を起点に取得する
 * - PostLike.createdAt の新しい順で並べる
 * - cursor がある場合は次ページを返す
 */
export async function getUserLikedPostFeedPageByUserId({
  userId,
  limit = PAGE_SIZE,
  cursor,
}: Input): Promise<FeedPage> {

  /**
   * 2. いいねログを取得（カーソルページング）
   */
  const likes = await prisma.postLike.findMany({
    where: {
      userId,
    },

    /**
     * 並び順（重要）
     * - createdAt DESC（新しい順）
     * - id DESC（同時刻対策）
     *
     * → cursor paginationで安定させるため複合ソート
     */
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],

    /**
     * limit + 1 件取得
     * → hasMore判定のため
     */
    take: limit + 1,

    /**
     * cursorがある場合（2ページ目以降）
     */
    ...(cursor
      ? {
          cursor: {
            // Prismaの複合ユニークキー（createdAt + id）
            createdAt_id: {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            },
          },
          skip: 1, // cursor自身を除外（重複防止）
        }
      : {}),
    
    /**
     * 必要なデータを取得（パフォーマンス最適化）
     */
    select: {
      createdAt: true,
      id: true,
  
      post: {
        select: postFeedItemSelect, // ✅ これ
      },
    },
  });

  /**
   * 3. hasMore判定
   * limit+1件取っているので
   * → limitを超えてたら「次ページあり」
   */
  const hasMore = likes.length > limit;

  /**
   * 4. 表示用データに切り出し
   */
  const sliced = hasMore ? likes.slice(0, limit) : likes;

  /**
   * 5. 次カーソル作成
   */
  const lastLike = sliced.at(-1);

  /**
   * 6. 表示用形式に整える
   */
  const currentUser = await getCurrentUser();
  const posts = sliced.map((like) => like.post);
  const feedItemOptionsContext = await createFeedItemOptionsContext({
    posts,
    currentUser,
  });
  const items: FeedItem[] = posts.map((post) =>
    toFeedItem(post, createFeedItemOptions(post, feedItemOptionsContext)),
  );

  return {
    items,

    nextCursor: lastLike
      ? {
          createdAt: lastLike.createdAt.toISOString(),
          id: lastLike.id,
        }
      : null,

    hasMore,
  };
}
