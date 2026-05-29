import "server-only";

import { getPostFeedPage } from "@/features/post/server/get-post-feed-page";
import { Cursor, FeedPage } from "@/features/post/types/post.types";
import { getCurrentSessionUserId } from "@/lib/auth/session";

/**
 * おすすめ投稿フィード取得の入力。
 */
type Input = {
  // 1ページあたりの取得件数。未指定時は共通フィード取得側のデフォルトを使う。
  limit?: number;

  // 次ページ取得用の cursor。初回取得では null / undefined。
  cursor?: Cursor | null;
};

/**
 * おすすめ投稿フィードを取得する。
 *
 * v1 のおすすめは「全体の新着順」。
 * 実際の取得・並び順・cursor pagination は getPostFeedPage に委譲し、
 * ここでは「おすすめ」というユースケースの入口だけを表現する。
 */
export async function getRecommendedPostFeedPage({
  limit,
  cursor,
}: Input = {}): Promise<FeedPage> {
  // protected 画面向けのデータなので、未ログイン時は投稿を返さない。
  const userId = await getCurrentSessionUserId();

  if (!userId) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  // where: {} により、全ユーザーの投稿を新着順で取得する。
  return getPostFeedPage({
    where: {},
    limit,
    cursor,
  });
}
