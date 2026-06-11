import type { Cursor, FeedPage } from "@/features/post/types/post.types";

const PAGE_SIZE = 10;

/**
 * 投稿フィードの cursor を URL query に安全に載せる。
 */
function encodeCursor(cursor: Cursor) {
  return encodeURIComponent(JSON.stringify(cursor));
}

type Input = {
  query?: string;
  cursor: Cursor;
  limit?: number;
  signal?: AbortSignal;
};

/**
 * メディアタブの次ページを取得する。
 *
 * query が空の場合は q を送らず、API 側では最新メディア一覧として扱う。
 * AbortSignal は無限スクロール側でタブ切替やアンマウント時に通信を止めるために渡す。
 */
export async function fetchMediaPostSearchPage({
  query,
  cursor,
  limit = PAGE_SIZE,
  signal,
}: Input): Promise<FeedPage> {
  const params = new URLSearchParams();

  // 空検索は「最新のメディア付き投稿」なので、q 自体を省略する。
  if (query) {
    params.set("q", query);
  }

  params.set("limit", String(limit));
  params.set("cursor", encodeCursor(cursor));

  const res = await fetch(`/api/search/posts/media?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("メディア検索結果の追加取得に失敗しました");
  }

  return (await res.json()) as FeedPage;
}
