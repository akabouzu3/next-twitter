"use client"
import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { UserProfile } from "@/features/user/server/get-user";
import { CurrentUser } from "@/lib/auth/current-user";
import { FeedPage } from "@/features/post/types/post.types";
import { fetchUserPostsPageByUsername } from "@/features/post/client/fetch-user-posts-page";
import { FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import UserPageHeader from "@/app/(protected)/users/[username]/_components/UserPageHeader";
import UserProfileComponent from "@/app/(protected)/users/[username]/_components/UserProfile";

type Props = {
  currentUser: CurrentUser;
  user: UserProfile;
  feedPage: FeedPage;
};


export default function UserPageView({
  currentUser,
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
      <UserPageHeader user={user}/>
      <UserProfileComponent currentUser={currentUser} user={user} />
      <FeedList initialPage={feedPage} fetchPage={fetchPage}></FeedList>
    </>
  )
}
