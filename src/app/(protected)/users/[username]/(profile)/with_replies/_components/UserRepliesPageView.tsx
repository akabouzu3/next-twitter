"use client";

import FeedList from "@/features/post/components/FeedList";
import { fetchUserRepliesPostFeedPageByUsername } from "@/features/post/client/fetch-user-replies-post-feed-page";
import { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import { FeedPage } from "@/features/post/types/post.types";
import { UserProfileItem } from "@/features/user/types/user.types";

type Props = {
  user: UserProfileItem;
  feedPage: FeedPage;
};

export default function UserRepliesPageView({ user, feedPage }: Props) {
  const fetchPage = (input: FetchPageInput) => {
    return fetchUserRepliesPostFeedPageByUsername({
      username: user.username,
      ...input,
    });
  };

  return <FeedList initialPage={feedPage} fetchPage={fetchPage} pageSize={10} />;
}
