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
 * 投稿取得関数の引数型
 */
export type Input = {
  username: string;
  cursor: Cursor; // 次ページ取得用カーソル
  limit?: number;                 // 取得件数（任意）
  signal?: AbortSignal;           // fetchキャンセル用（React Query等で重要）
};

/**
 * ユーザ投稿の次ページを取得する関数
 */
export async function fetchUserMediaPostFeedPageByUsername({
  username,
  cursor,
  limit = PAGE_SIZE, // 指定がなければ10件
  signal,
}: Input): Promise<FeedPage> {
  
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
   * → リアルタイム性が必要なので cache: "no-store"
   */
  const res = await fetch(`/api/posts/${username}/media?${params.toString()}`, {
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