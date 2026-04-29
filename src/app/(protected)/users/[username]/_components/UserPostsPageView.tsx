"use client"
import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { UserProfile } from "@/features/user/server/get-user";
import { FeedPage } from "@/features/post/types/post.types";
import { fetchUserPostsPageByUsername } from "@/features/post/client/fetch-user-posts-page";
import { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
// import ScrollToTopOnUserChange from "@/app/(protected)/users/[username]/_components/ScrollToTopOnUserChange";


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
      {/* 他のユーザー詳細ページにいった際、スクロール位置がリセットされるようにする */}
      {/* <ScrollToTopOnUserChange username={user.username} /> */}
    </>
  )
}
