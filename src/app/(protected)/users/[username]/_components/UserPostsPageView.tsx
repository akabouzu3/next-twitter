"use client"
import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { UserProfile } from "@/features/user/server/get-user";
import { FeedPage } from "@/features/post/types/post.types";
import { fetchUserPostsPageByUsername } from "@/features/post/client/fetch-user-posts-page";
import { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";


type Props = {
  user: UserProfile;
  feedPage: FeedPage;
};


export default function UserPageView({
  user,
  feedPage,
}: Props) {

  /**
   * useInfinityFeed内で使用する、追加の投稿を取得する関数
   */
  const fetchPage = useCallback(
    (input: FetchPageInput) => {
      return fetchUserPostsPageByUsername({
        username: user.username,
        ...input,
      });
    },
    [user]
  );

  return (
    <>
      <FeedList initialPage={feedPage} fetchPage={fetchPage}></FeedList>
    </>
  )
}
