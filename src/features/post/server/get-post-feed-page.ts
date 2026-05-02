import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { Cursor, FeedItem, FeedPage } from "@/features/post/types/post.types";
import { postFeedItemSelect, PostFeedItemPayload } from "@/features/post/server/selects/selects";
import { toFeedItem } from "@/features/post/server/mappers/mappers";

// 1ページあたりの取得件数（無限スクロールの単位）
const PAGE_SIZE = 10;

/**
 * 入力パラメータ
 */
type Input = {
  where: Prisma.PostWhereInput;
  limit?: number;
  // 前回の最後の投稿（cursor pagination）
  cursor?: Cursor | null;
};

/**
 * username からそのユーザーの投稿一覧を取得する
 *
 * - まず User を username で引いて id を取得
 * - その後 Post を userId で取得
 * - cursor がある場合は次ページを返す
 */
export async function getPostFeedPage({
  where,
  limit = PAGE_SIZE,
  cursor,
}: Input): Promise<FeedPage> {

  /**
   * 2. 投稿取得（カーソルページング）
   */
  const posts: PostFeedItemPayload[] = await prisma.post.findMany({
    where,

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
    select: postFeedItemSelect,
  });

  /**
   * 3. hasMore判定
   * limit+1件取っているので
   * → limitを超えてたら「次ページあり」
   */
  const hasMore = posts.length > limit;

  /**
   * 4. 表示用データに切り出し
   */
  const sliced: PostFeedItemPayload[] = hasMore ? posts.slice(0, limit) : posts;

  /**
   * 5. 次カーソル作成
   */
  const lastPost = sliced.at(-1);

  /**
   * 6. 表示用形式に整える
   */
  const items: FeedItem[] = sliced.map((post) => toFeedItem(post));

  return {
    items,

    nextCursor: lastPost
      ? {
          createdAt: lastPost.createdAt.toISOString(),
          id: lastPost.id,
        }
      : null,

    hasMore,
  };
}