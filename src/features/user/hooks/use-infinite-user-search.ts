"use client";

import {
  FetchUserListPageInput,
  useInfiniteUserList,
} from "@/features/user/hooks/use-infinite-user-list";
import type {
  UserSearchCursor,
  UserSearchItem,
  UserSearchPage,
} from "@/features/user/types/user.types";

export type FetchUserSearchPageInput = FetchUserListPageInput<UserSearchCursor>;

type Props = {
  initialPage: UserSearchPage;
  fetchPage: (input: FetchUserSearchPageInput) => Promise<UserSearchPage>;
  pageSize?: number;
};

export function useInfiniteUserSearch(props: Props) {
  return useInfiniteUserList<
    UserSearchItem,
    UserSearchCursor,
    UserSearchPage
  >({
    ...props,
    errorMessage: "アカウント検索結果の読み込みに失敗しました",
  });
}
