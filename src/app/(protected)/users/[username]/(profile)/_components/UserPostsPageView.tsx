"use client"
import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { FeedPage } from "@/features/post/types/post.types";
import { fetchUserPostFeedPageByUsername } from "@/features/post/client/fetch-user-post-feed-page";
import { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import ScrollToTopOnUserChange from "@/app/(protected)/users/[username]/(profile)/_components/ScrollToTopOnUserChange";
import { UserProfileItem } from "@/features/user/types/user.types";


type Props = {
  user: UserProfileItem;
  feedPage: FeedPage;
};


export default function UserPostsPageView({
  user,
  feedPage,
}: Props) {

  /**
   * useInfinityFeed内で使用する、追加の投稿を取得する関数
   */
  const fetchPage = useCallback(
    (input: FetchPageInput) => {
      return fetchUserPostFeedPageByUsername({
        username: user.username,
        ...input,
      });
    },
    [user.username]
  );

  return (
    <>
      <FeedList initialPage={feedPage} fetchPage={fetchPage} pageSize={10} />
      {/* 他のユーザー詳細ページにいった際、スクロール位置がリセットされるようにする */}
      <ScrollToTopOnUserChange user={user} />
    </>
  )
}
