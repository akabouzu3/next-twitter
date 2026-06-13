"use client";

import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { fetchLatestPostSearchPage } from "@/features/post/client/fetch-latest-post-search-page";
import type { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import type { FeedPage } from "@/features/post/types/post.types";

type Props = {
  initialPage: FeedPage;
  query: string;
  emptyMessage: string;
  endMessage?: string;
  pageSize?: number;
};

/**
 * 最新タブの投稿一覧。
 *
 * 初期ページは Server Component で取得し、2ページ目以降だけ API から取得する。
 */
export default function LatestPostSearchList({
  initialPage,
  query,
  emptyMessage,
  endMessage = "検索結果は以上です",
  pageSize = 10,
}: Props) {
  const fetchPage = useCallback(
    (input: FetchPageInput) =>
      fetchLatestPostSearchPage({
        query,
        ...input,
      }),
    [query],
  );

  return (
    <FeedList
      initialPage={initialPage}
      fetchPage={fetchPage}
      pageSize={pageSize}
      emptyMessage={emptyMessage}
      endMessage={endMessage}
    />
  );
}
