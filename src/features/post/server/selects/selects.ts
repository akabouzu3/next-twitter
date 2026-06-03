// src/features/post/server/selects.ts
import { Prisma } from "@prisma/client";

/**
 * FeedItem に変換するための投稿 select
 *
 * - timeline
 * - user detail posts
 * - media posts
 *
 * などで共通利用する
 * 
 * 役割
 * - DBから取得するカラムを制限（パフォーマンス最適化）
 * - 返却データの shape を固定
 *
 * satisfies の意味
 * - Prisma.PostSelectとして正しい形かを型チェック
 * - ただし型推論は壊さない（重要）
 */
export const postFeedItemSelect = {
  id: true,
  content: true,
  viewCount: true,
  createdAt: true,

  /**
   * 投稿者情報（リレーション）
   */
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },

  /**
   * 投稿画像（複数）
   */
  images: {
    orderBy: [
      { sortOrder: "asc" }, // 表示順
      { id: "asc" },        // 同一順序時の安定ソート
    ],
    select: {
      id: true,
      url: true,
    },
  },

  /**
   * 集計情報
   */
  _count: {
    select: {
      likes: true, // いいね数
    },
  },
} satisfies Prisma.PostSelect;


/**
 * selectから型を自動生成
 *
 * 重要
 * - selectと型が完全に一致する
 * - selectを変更すると型も自動更新される
 */
export type PostFeedItemPayload = Prisma.PostGetPayload<{
  select: typeof postFeedItemSelect;
}>;
