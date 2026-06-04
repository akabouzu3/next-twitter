import { FeedPage, Cursor } from "@/features/post/types/post.types";

const PAGE_SIZE = 10;

/**
 * フィードのカーソルを URL クエリへ載せられる文字列に変換する。
 *
 * API route 側では、この値をデコードして JSON として読み直す。
 *
 * @param cursor 次ページ取得の基準になるカーソル。
 * @returns URL エンコード済みのカーソル文字列。
 */
function encodeCursor(cursor: Cursor) {
  return encodeURIComponent(JSON.stringify(cursor));
}

type Input = {
  postId: string;
  cursor: Cursor;
  limit?: number;
  signal?: AbortSignal;
};

/**
 * 指定した投稿に紐づく返信フィードの次ページを取得する。
 *
 * クライアント側の無限スクロール/追加読み込みから呼び出す想定で、
 * `cursor` と `limit` をクエリパラメータとして API route に渡す。
 *
 * @param postId 返信を取得する対象投稿の ID。
 * @param cursor 次ページ取得の基準になるカーソル。
 * @param limit 1 ページあたりの取得件数。未指定時は PAGE_SIZE を使う。
 * @param signal リクエストを中断するための AbortSignal。
 * @returns 返信フィードの追加ページ。
 * @throws API が正常に応答しなかった場合。
 */
export async function fetchPostRepliesFeedPage({
  postId,
  cursor,
  limit = PAGE_SIZE,
  signal,
}: Input): Promise<FeedPage> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("cursor", encodeCursor(cursor));

  // 追加読み込みでは常に最新の返信状態を見たいので、ブラウザ/Next.js のキャッシュを使わない。
  const res = await fetch(`/api/post-replies/${postId}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("返信の追加取得に失敗しました");
  }

  return (await res.json()) as FeedPage;
}
