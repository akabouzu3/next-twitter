import "server-only";

import { Prisma } from "@prisma/client";
import {
  createFeedItemOptions,
  createFeedItemOptionsContext,
} from "@/features/post/server/create-feed-item-options";
import { toFeedItem } from "@/features/post/server/mappers/mappers";
import {
  postFeedItemSelect,
  type PostFeedItemPayload,
} from "@/features/post/server/selects/selects";
import type {
  FeedItem,
  FeedPage,
  TopPostSearchCursor,
} from "@/features/post/types/post.types";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma/prisma";

const PAGE_SIZE = 10;

/**
 * 話題のポスト検索で受け取る入力。
 *
 * 通常の投稿フィードとは並び順が異なり、score を含む専用 cursor を使う。
 */
type GetTopPostSearchPageInput = {
  /**
   * 投稿本文に対する検索語。
   *
   * 未指定または空文字の場合は検索条件を付けず、
   * 全体の話題投稿一覧として取得する。
   */
  query?: string;
  limit?: number;
  cursor?: TopPostSearchCursor | null;
};

/**
 * raw SQL で取得するランキング用の最小 shape。
 *
 * UI 表示に必要な投稿本文・投稿者・画像などは、この後 Prisma select で取得する。
 */
type TopPostSearchRankRow = {
  id: string;
  createdAt: Date;
  score: number | bigint;
};

/**
 * 投稿本文検索用の SQL fragment を作る。
 *
 * Prisma.sql の interpolation を使い、`%query%` も含めて parameterized query として扱う。
 */
function createContentFilter(query: string) {
  if (!query) {
    return Prisma.empty;
  }

  return Prisma.sql`AND p.content ILIKE ${`%${query}%`}`;
}

/**
 * 話題順 cursor pagination 用の SQL fragment を作る。
 *
 * 並び順は `score DESC, createdAt DESC, id DESC`。
 * 次ページでは、その並び順で cursor より後ろにある行だけを取得する。
 */
function createCursorFilter(cursor?: TopPostSearchCursor | null) {
  if (!cursor) {
    return Prisma.empty;
  }

  return Prisma.sql`
    WHERE
      score < ${cursor.score}
      OR (score = ${cursor.score} AND "createdAt" < ${new Date(cursor.createdAt)})
      OR (
        score = ${cursor.score}
        AND "createdAt" = ${new Date(cursor.createdAt)}
        AND id < ${cursor.id}
      )
  `;
}

/**
 * 話題タブ用の投稿フィードを engagement score 順で取得する。
 *
 * スコアは Post.engagementScore に保存済みの値を使う。
 * 同点時は `createdAt DESC, id DESC` で安定した順序にする。
 *
 * raw SQL はランキングだけに使い、UI 用の FeedItem 変換は既存の
 * `postFeedItemSelect` / mapper / option context に委譲する。
 */
export async function getTopPostSearchPage({
  query,
  limit = PAGE_SIZE,
  cursor,
}: GetTopPostSearchPageInput = {}): Promise<FeedPage<TopPostSearchCursor>> {
  const normalizedQuery = query?.trim() ?? "";

  /**
   * まずランキングに必要な id / createdAt / score だけを取得する。
   *
   * - Post に保存済みの engagementScore を score として使う
   * - 返信投稿自身は検索結果から除外し、親投稿だけを対象にする
   * - limit + 1 件取ることで、次ページの有無を判定する
   */
  const rankedRows = await prisma.$queryRaw<TopPostSearchRankRow[]>`
    WITH ranked AS (
      SELECT
        p.id,
        p."createdAt",
        p."engagementScore" AS score
      FROM "Post" p
      WHERE p."parentPostId" IS NULL
      ${createContentFilter(normalizedQuery)}
    )
    SELECT id, "createdAt", score
    FROM ranked
    ${createCursorFilter(cursor)}
    ORDER BY score DESC, "createdAt" DESC, id DESC
    LIMIT ${limit + 1}
  `;

  /**
   * `limit + 1` 件目は hasMore 判定専用。
   * UI に返す items と nextCursor は、実際に表示する `limit` 件だけから作る。
   */
  const hasMore = rankedRows.length > limit;
  const slicedRows = hasMore ? rankedRows.slice(0, limit) : rankedRows;
  const postIds = slicedRows.map((row) => row.id);

  if (postIds.length === 0) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  /**
   * ランキング SQL では id だけを決め、表示に必要な投稿 shape は Prisma select で取得する。
   *
   * これにより、FeedItem の shape と現在ユーザー基準の状態補完は既存フィードと揃う。
   */
  const posts = await prisma.post.findMany({
    where: {
      id: {
        in: postIds,
      },
    },
    select: postFeedItemSelect,
  });

  /**
   * `findMany({ where: { id: { in }}})` は入力 id 順を保証しないため、
   * rankedRows の順序に並べ直してから FeedItem に変換する。
   */
  const postById = new Map(posts.map((post) => [post.id, post]));
  const orderedPosts: PostFeedItemPayload[] = postIds.flatMap((postId) => {
    const post = postById.get(postId);

    return post ? [post] : [];
  });

  const currentUser = await getCurrentUser();
  const feedItemOptionsContext = await createFeedItemOptionsContext({
    posts: orderedPosts,
    currentUser,
  });
  const items: FeedItem[] = orderedPosts.map((post) =>
    toFeedItem(post, createFeedItemOptions(post, feedItemOptionsContext)),
  );

  const lastRow = slicedRows.at(-1);

  /**
   * 次ページ cursor には、並び順を完全に再現できる3要素を入れる。
   * score だけでは同点投稿のページングが不安定になる。
   */
  return {
    items,
    nextCursor: lastRow
      ? {
          createdAt: lastRow.createdAt.toISOString(),
          id: lastRow.id,
          score: Number(lastRow.score),
        }
      : null,
    hasMore,
  };
}
