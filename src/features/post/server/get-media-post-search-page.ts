import "server-only";

import { Prisma } from "@prisma/client";
import { getPostFeedPage } from "@/features/post/server/get-post-feed-page";
import type { Cursor, FeedPage } from "@/features/post/types/post.types";

type GetMediaPostSearchPageInput = {
  /**
   * 投稿本文に対する検索語。
   *
   * 未指定または空文字の場合は検索条件を付けず、
   * 最新のメディア付き投稿一覧として取得する。
   */
  query?: string;
  limit?: number;
  cursor?: Cursor | null;
};

/**
 * メディア付き投稿検索の Prisma where を組み立てる。
 *
 * この検索では「メディア付き」を `Post.images` が1件以上あることとして扱う。
 * query が空のときは本文条件を付けず、最新メディア一覧として使えるようにする。
 */
function createMediaPostSearchWhere(query: string): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {
    images: { some: {} },
  };

  if (query) {
    where.content = {
      contains: query,
      mode: "insensitive",
    };
  }

  return where;
}

/**
 * メディアタブ用の投稿フィードを cursor pagination で取得する。
 *
 * - query あり: 本文に query を含むメディア付き投稿を取得
 * - query なし: 最新のメディア付き投稿を取得
 *
 * 並び順、返信除外、FeedItem への変換、次 cursor の生成は
 * 共通の `getPostFeedPage` に委譲する。
 */
export async function getMediaPostSearchPage({
  query,
  limit,
  cursor,
}: GetMediaPostSearchPageInput): Promise<FeedPage> {
  const normalizedQuery = query?.trim() ?? "";

  return getPostFeedPage({
    where: createMediaPostSearchWhere(normalizedQuery),
    limit,
    cursor,
  });
}
