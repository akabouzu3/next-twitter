import { FeedPage, Cursor } from "@/features/post/types/post.types";

// 1回の取得件数（デフォルト）
const PAGE_SIZE = 10;

/**
 * cursor を安全に URL に乗せるためにエンコードする関数
 * URLで使えない文字を全部エスケープする
 *
 * なぜ必要？
 * - cursor はオブジェクト（例: { id, createdAt }）なのでそのままURLに入れられない
 * - JSON.stringifyで文字列化 → encodeURIComponentでURL安全にする
 */
function encodeCursor(cursor: Cursor) {
  if (!cursor) return null; // cursorが無い場合はnull
  return encodeURIComponent(JSON.stringify(cursor));
}

/**
 * タイムライン取得関数の引数型
 */
type fetchTimelinePageInput = {
  cursor: Cursor; // 次ページ取得用カーソル
  limit?: number;                 // 取得件数（任意）
  signal?: AbortSignal;           // fetchキャンセル用（React Query等で重要）
};

/**
 * タイムラインの次ページを取得する関数
 */
export async function fetchTimelinePage({
  cursor,
  limit = PAGE_SIZE, // 指定がなければ10件
  signal,
}: fetchTimelinePageInput): Promise<FeedPage> {
  
  // cursorをURL用にエンコード
  const encodedCursor = encodeCursor(cursor);

  // cursorが無い場合はエラー
  // → 無限スクロールの「次ページが無い状態」で呼ばれないようにするため
  if (!encodedCursor) {
    throw new Error("cursor がありません");
  }

  // クエリパラメータ生成
  const params = new URLSearchParams();
  params.set("limit", String(limit));   // 件数
  params.set("cursor", encodedCursor);  // カーソル

  /**
   * APIリクエスト
   *
   * Next.js 15 の fetch 特徴：
   * - デフォルトでキャッシュされる
   * → タイムラインはリアルタイム性が必要なので cache: "no-store"
   */
  const res = await fetch(`/api/posts/timeline?${params.toString()}`, {
    method: "GET",
    cache: "no-store", // 常に最新データを取得
    signal,            // AbortController対応（重要）
  });

  // HTTPエラー時
  if (!res.ok) {
    throw new Error("投稿の追加取得に失敗しました");
  }

  // JSONレスポンスをFeedPage型として返す
  return (await res.json()) as FeedPage;
}