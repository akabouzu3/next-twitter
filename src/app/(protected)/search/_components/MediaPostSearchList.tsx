"use client";

import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { fetchMediaPostSearchPage } from "@/features/post/client/fetch-media-post-search-page";
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
 * メディアタブの投稿一覧。
 *
 * 初期ページは Server Component で取得済みのものを受け取り、
 * 2ページ目以降だけ client fetch + `FeedList` の無限スクロールに任せる。
 */
export default function MediaPostSearchList({
  initialPage,
  query,
  emptyMessage,
  endMessage = "検索結果は以上です",
  pageSize = 10,
}: Props) {
  /**
   * FeedList / useInfiniteFeed から呼ばれる追加取得関数。
   *
   * query が空でも最新メディア一覧として fetch できるように、
   * `fetchMediaPostSearchPage` 側で q の送信有無を調整している。
   */
  const fetchPage = useCallback(
    (input: FetchPageInput) =>
      fetchMediaPostSearchPage({
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
