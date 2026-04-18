import { FeedPage } from "@/features/post/types/post.types";

const PAGE_SIZE = 10;

function encodeCursor(cursor: FeedPage["nextCursor"]) {
  if (!cursor) return null;
  return encodeURIComponent(JSON.stringify(cursor));
}

type FetchTimelinePageInput = {
  cursor: FeedPage["nextCursor"];
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchTimelinePage({
  cursor,
  limit = PAGE_SIZE,
  signal,
}: FetchTimelinePageInput): Promise<FeedPage> {
  const encodedCursor = encodeCursor(cursor);

  if (!encodedCursor) {
    throw new Error("cursor がありません");
  }

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("cursor", encodedCursor);

  const res = await fetch(`/api/posts/timeline?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("投稿の追加取得に失敗しました");
  }

  return res.json();
}