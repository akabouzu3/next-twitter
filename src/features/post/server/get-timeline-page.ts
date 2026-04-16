import "server-only"; // Server Component / Server Action専用であることを保証

import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
import { Cursor, FeedItem } from "@/features/post/types/post.types";
import { TimelinePage } from "@/features/post/types/post.types";

// 1ページあたりの取得件数（無限スクロールの単位）
const PAGE_SIZE = 10;

/**
 * 入力パラメータ
 */
type GetTimelinePageInput = {
  limit?: number;

  // 前回の最後の投稿（cursor pagination）
  cursor?: Cursor | null;
};

/**
 * タイムライン取得（無限スクロール対応）
 */
export async function getTimelinePage({
  limit = PAGE_SIZE,
  cursor,
}: GetTimelinePageInput = {}): Promise<TimelinePage> {
  
  /**
   * 1. ログインユーザー取得
   */
  const userId = await getCurrentSessionUserId();

  // 未ログインなら空返す（APIとして安全）
  if (!userId) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  /**
   * 2. フォロー中ユーザー取得
   */
  const follows = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  // フォロー中のID配列に変換
  const followingIds = follows.map((f) => f.followingId);

  // 自分の投稿も含める
  followingIds.push(userId);

  /**
   * 3. 投稿取得（カーソルページング）
   */
  const posts = await prisma.post.findMany({
    where: {
      userId: {
        in: followingIds, // フォロー中 + 自分
      },
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
     * 必要なデータだけ取得（パフォーマンス最適化）
     */
    select: {
      id: true,
      content: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },

      images: {
        select: {
          id: true,
          url: true,
        },
      },

      _count: {
        select: {
          likes: true, // いいね数
        },
      },
    },
  });

  /**
   * 4. hasMore判定
   * limit+1件取っているので
   * → limitを超えてたら「次ページあり」
   */
  const hasMore = posts.length > limit;

  /**
   * 5. 表示用データに切り出し
   */
  const sliced = hasMore ? posts.slice(0, limit) : posts;

  /**
   * 6. 次カーソル作成
   */
  const lastPost = sliced.at(-1);

  /**
   * 7. 表示用形式に整える
   */
  const items: FeedItem[] = sliced.map<FeedItem>((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    user: {
      id: post.user.id,
      name: post.user.name,
      username: post.user.username,
      image: post.user.image,
    },
    images: post.images.map((image) => ({
      id: image.id,
      url: image.url,
    })),
    likeCount: post._count.likes,
  }));

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