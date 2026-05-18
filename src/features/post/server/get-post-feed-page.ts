import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { Cursor, FeedItem, FeedPage } from "@/features/post/types/post.types";
import { postFeedItemSelect, PostFeedItemPayload } from "@/features/post/server/selects/selects";
import { toFeedItem } from "@/features/post/server/mappers/mappers";

// 1ページあたりの取得件数（無限スクロール単位）
const PAGE_SIZE = 10;

/**
 * 入力パラメータ
 *
 * - where: 投稿の絞り込み条件（ユーザー投稿 / メディア / いいね など）
 * - limit: 1回で取得する件数
 * - cursor: 次ページ取得用のカーソル
 */
type Input = {
  where: Prisma.PostWhereInput;
  limit?: number;
  cursor?: Cursor | null;
};

/**
 * =========================================
 * Post Feed 取得（共通コア）
 * =========================================
 *
 * ■ 役割
 * - Post を cursor pagination で取得
 * - FeedPage 形式に変換して返す
 *
 * ■ 想定ユースケース
 * - タイムライン
 * - ユーザー投稿一覧
 * - メディア投稿一覧
 * - いいね投稿一覧（※並び順によっては別実装推奨）
 *
 * ■ 設計ポイント
 * - where を外から受け取ることで汎用化
 * - cursor pagination により無限スクロール対応
 * - select + mapper により返却データを最適化
 */
export async function getPostFeedPage({
  where,
  limit = PAGE_SIZE,
  cursor,
}: Input): Promise<FeedPage> {

  /**
   * 1. 投稿取得（cursor pagination）
   */
  const posts: PostFeedItemPayload[] = await prisma.post.findMany({
    where,

    /**
     * 並び順（重要）
     *
     * - createdAt DESC（新しい順）
     * - id DESC（同時刻対策）
     *
     * ■ なぜ必要か？
     * createdAt が同じ投稿が存在するため、
     * id を含めた複合ソートで順序を一意に決定する
     *
     * → cursor pagination の安定性を担保
     */
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],

    /**
     * limit + 1 件取得
     *
     * ■ 目的
     * - 次ページが存在するか判定するため
     *
     * 例:
     * - limit = 10 の場合
     * - 11件取れた → hasMore = true
     * - 10件以下 → hasMore = false
     */
    take: limit + 1,

    /**
     * cursor がある場合（2ページ目以降）
     *
     * ■ cursor pagination の仕組み
     * - 前回の最後の投稿を基準に次を取得
     *
     * ■ skip: 1 の理由
     * - cursor に指定した投稿自身を除外するため（重複防止）
     */
    ...(cursor
      ? {
          cursor: {
            // 複合ユニークキー（createdAt + id）
            createdAt_id: {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            },
          },
          skip: 1,
        }
      : {}),
    
    /**
     * select による取得データの最適化
     *
     * - 不要なカラムを取得しない（パフォーマンス向上）
     * - mapper で扱いやすい shape に揃える
     */
    select: postFeedItemSelect,
  });

  /**
   * 2. 次ページが存在するか判定
   */
  const hasMore = posts.length > limit;

  /**
   * 3. 表示用データに調整
   *
   * - limit + 1 件取得しているため
   * - 余分な1件を削除
   */
  const sliced: PostFeedItemPayload[] = hasMore
    ? posts.slice(0, limit)
    : posts;

  /**
   * 4. 次カーソル作成
   *
   * - 最後の投稿を次回取得の基準にする
   */
  const lastPost = sliced.at(-1);

  /**
   * 5. UI用データに変換（mapper）
   *
   * - DBのshape → UI用FeedItemへ変換
   */
  const items: FeedItem[] = sliced.map((post) => toFeedItem(post));

  /**
   * 6. FeedPageとして返却
   */
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