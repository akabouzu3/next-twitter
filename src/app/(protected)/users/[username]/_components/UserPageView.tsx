"use client"
import { useCallback } from "react";
import FeedList from "@/features/post/components/FeedList";
import { UserProfile } from "@/features/user/server/get-user";
import { CurrentUser } from "@/lib/auth/current-user";
import { Cursor, FeedPage } from "@/features/post/types/post.types";
import { fetchUserPostsPageByUsername } from "@/features/post/client/fetch-user-posts-page";

type Props = {
  currentUser: CurrentUser;
  user: UserProfile;
  feedPage: FeedPage;
};

type FetchPageInput = {
  cursor: Cursor; // 次ページ取得用カーソル
  limit?: number;                 // 取得件数（任意）
  signal?: AbortSignal;           // fetchキャンセル用（React Query等で重要）
};


export default function UserPageView({
  currentUser,
  user,
  feedPage,
}: Props) {

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
