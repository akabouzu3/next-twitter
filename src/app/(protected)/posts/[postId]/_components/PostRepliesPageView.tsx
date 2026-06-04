"use client";

import FeedList from "@/features/post/components/FeedList";
import { fetchPostRepliesFeedPage } from "@/features/post/client/fetch-post-replies-feed-page";
import { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import { FeedPage } from "@/features/post/types/post.types";

type Props = {
  postId: string;
  repliesPage: FeedPage;
};

export default function PostRepliesPageView({ postId, repliesPage }: Props) {
  const fetchPage = (input: FetchPageInput) => {
    return fetchPostRepliesFeedPage({
      postId,
      ...input,
    });
  };

  return <FeedList initialPage={repliesPage} fetchPage={fetchPage} pageSize={10} />;
}
