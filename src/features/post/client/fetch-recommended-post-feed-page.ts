import { FeedPage, Cursor } from "@/features/post/types/post.types";

// 1回の追加取得件数（無限スクロールのデフォルト）
const PAGE_SIZE = 10;

/**
 * cursor を URL query に安全に乗せるためにエンコードする。
 *
 * cursor は `{ createdAt, id }` のオブジェクトなので、そのまま query string には入れず、
 * JSON文字列化してから URL エンコードする。
 */
function encodeCursor(cursor: Cursor) {
  if (!cursor) return null;
  return encodeURIComponent(JSON.stringify(cursor));
}

/**
 * おすすめ投稿の次ページ取得に必要な入力。
 */
type FetchRecommendedPostFeedPageInput = {
  // 前回取得した最後の投稿。cursor pagination の基準になる。
  cursor: Cursor;

  // 取得件数。未指定時は PAGE_SIZE を使う。
  limit?: number;

  // コンポーネント破棄や再取得時に request を中断するために使う。
  signal?: AbortSignal;
};

/**
 * おすすめ投稿フィードの次ページを取得する。
 *
 * 初回ページは Server Component 側で取得し、この関数は無限スクロールで
 * 2ページ目以降を追加取得するときに使う。
 */
export async function fetchRecommendedPostFeedPage({
  cursor,
  limit = PAGE_SIZE,
  signal,
}: FetchRecommendedPostFeedPageInput): Promise<FeedPage> {
  // API側で cursor を復元できるよう、JSON + URL encode 済みの文字列にする。
  const encodedCursor = encodeCursor(cursor);

  // hasMore=false の状態では呼ばれない想定だが、誤用時は早めに失敗させる。
  if (!encodedCursor) {
    throw new Error("cursor がありません");
  }

  // API Route の search params を組み立てる。
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("cursor", encodedCursor);

  // フィードは新鮮さが重要なので、ブラウザ/Next.js のキャッシュを使わない。
  const res = await fetch(`/api/posts/recommended?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("おすすめ投稿の追加取得に失敗しました");
  }

  // API のレスポンス shape は FeedPage に揃えている。
  return (await res.json()) as FeedPage;
}
