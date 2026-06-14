"use client";

import {
  FetchUserListPageInput,
  useInfiniteUserList,
} from "@/features/user/hooks/use-infinite-user-list";
import type {
  UserConnectionCursor,
  UserConnectionItem,
  UserConnectionPage,
} from "@/features/user/types/user.types";

export type FetchUserConnectionsPageInput =
  FetchUserListPageInput<UserConnectionCursor>;

type Props = {
  initialPage: UserConnectionPage;
  fetchPage: (
    input: FetchUserConnectionsPageInput,
  ) => Promise<UserConnectionPage>;
  pageSize?: number;
};

export function useInfiniteUserConnections(props: Props) {
  return useInfiniteUserList<
    UserConnectionItem,
    UserConnectionCursor,
    UserConnectionPage
  >({
    ...props,
    errorMessage: "ユーザー一覧の読み込みに失敗しました",
  });
}
