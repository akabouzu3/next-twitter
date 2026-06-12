import "server-only";

import { Prisma } from "@prisma/client";
import { getPostFeedPage } from "@/features/post/server/get-post-feed-page";
import type { Cursor, FeedPage } from "@/features/post/types/post.types";

type GetLatestPostSearchPageInput = {
  /**
   * 投稿本文に対する検索語。
   *
   * 未指定または空文字の場合は検索条件を付けず、
   * 最新投稿一覧として取得する。
   */
  query?: string;
  limit?: number;
  cursor?: Cursor | null;
};

function createLatestPostSearchWhere(query: string): Prisma.PostWhereInput {
  if (!query) {
    return {};
  }

  return {
    content: {
      contains: query,
      mode: "insensitive",
    },
  };
}

/**
 * 最新タブ用の投稿フィードを cursor pagination で取得する。
 *
 * query がある場合は本文一致で絞り込み、ない場合は最新投稿一覧として扱う。
 */
export async function getLatestPostSearchPage({
  query,
  limit,
  cursor,
}: GetLatestPostSearchPageInput): Promise<FeedPage> {
  const normalizedQuery = query?.trim() ?? "";

  return getPostFeedPage({
    where: createLatestPostSearchWhere(normalizedQuery),
    limit,
    cursor,
  });
}
