import type {
  FeedPage,
  TopPostSearchCursor,
} from "@/features/post/types/post.types";

const PAGE_SIZE = 10;

function encodeCursor(cursor: TopPostSearchCursor) {
  return encodeURIComponent(JSON.stringify(cursor));
}

type Input = {
  query?: string;
  cursor: TopPostSearchCursor;
  limit?: number;
  signal?: AbortSignal;
};

/**
 * 話題タブの次ページを取得する。
 *
 * query が空の場合は q を送らず、API 側では全体の話題投稿一覧として扱う。
 */
export async function fetchTopPostSearchPage({
  query,
  cursor,
  limit = PAGE_SIZE,
  signal,
}: Input): Promise<FeedPage<TopPostSearchCursor>> {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  params.set("limit", String(limit));
  params.set("cursor", encodeCursor(cursor));

  const res = await fetch(`/api/search/posts/top?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("話題のポスト検索結果の追加取得に失敗しました");
  }

  return (await res.json()) as FeedPage<TopPostSearchCursor>;
}
