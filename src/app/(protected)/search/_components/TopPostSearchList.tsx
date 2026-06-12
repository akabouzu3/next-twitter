"use client";

import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { fetchTopPostSearchPage } from "@/features/post/client/fetch-top-post-search-page";
import type { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import type {
  FeedPage,
  TopPostSearchCursor,
} from "@/features/post/types/post.types";

type Props = {
  initialPage: FeedPage<TopPostSearchCursor>;
  query: string;
  emptyMessage: string;
  endMessage?: string;
  pageSize?: number;
};

/**
 * 話題タブの投稿一覧。
 *
 * 初期ページは Server Component で取得し、2ページ目以降だけ API から取得する。
 */
export default function TopPostSearchList({
  initialPage,
  query,
  emptyMessage,
  endMessage = "検索結果は以上です",
  pageSize = 10,
}: Props) {
  const fetchPage = useCallback(
    (input: FetchPageInput<TopPostSearchCursor>) =>
      fetchTopPostSearchPage({
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
