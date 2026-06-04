"use client";

import FeedList from "@/features/post/components/FeedList";
import { fetchRecommendedPostFeedPage } from "@/features/post/client/fetch-recommended-post-feed-page";
import { fetchTimelinePage } from "@/features/post/client/fetch-timeline-page";
import type { FeedPage } from "@/features/post/types/post.types";

type AppFeed = "recommended" | "following";

type Props = {
  activeFeed: AppFeed;
  feedPage: FeedPage;
};

export default function AppFeedPageView({ activeFeed, feedPage }: Props) {
  const fetchPage =
    activeFeed === "following"
      ? fetchTimelinePage
      : fetchRecommendedPostFeedPage;

  return <FeedList initialPage={feedPage} fetchPage={fetchPage} pageSize={20} />;
}
