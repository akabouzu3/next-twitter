import type { Cursor, FeedPage } from "@/features/post/types/post.types";

const PAGE_SIZE = 10;

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
 * 最新タブの次ページを取得する。
 *
 * query が空の場合は q を送らず、API 側では最新投稿一覧として扱う。
 */
export async function fetchLatestPostSearchPage({
  query,
  cursor,
  limit = PAGE_SIZE,
  signal,
}: Input): Promise<FeedPage> {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  params.set("limit", String(limit));
  params.set("cursor", encodeCursor(cursor));

  const res = await fetch(`/api/search/posts/latest?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("最新ポスト検索結果の追加取得に失敗しました");
  }

  return (await res.json()) as FeedPage;
}
