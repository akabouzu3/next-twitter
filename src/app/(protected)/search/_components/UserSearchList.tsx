"use client";

import { useCallback } from "react";
import UserListRow from "@/features/user/components/UserListRow";
import { fetchUserSearchPage } from "@/features/user/client/fetch-user-search-page";
import {
  FetchUserSearchPageInput,
  useInfiniteUserSearch,
} from "@/features/user/hooks/use-infinite-user-search";
import type { UserSearchPage } from "@/features/user/types/user.types";

type Props = {
  initialPage: UserSearchPage;
  query: string;
  emptyMessage: string;
  endMessage?: string;
  pageSize?: number;
};

export default function UserSearchList({
  initialPage,
  query,
  emptyMessage,
  endMessage = "検索結果は以上です",
  pageSize = 20,
}: Props) {
  const fetchPage = useCallback(
    (input: FetchUserSearchPageInput) =>
      fetchUserSearchPage({
        query,
        ...input,
      }),
    [query],
  );

  const {
    items,
    hasMore,
    isLoading,
    error,
    observerRef,
    retry,
  } = useInfiniteUserSearch({
    initialPage,
    fetchPage,
    pageSize,
  });

  const showEmpty = !isLoading && !error && items.length === 0;
  const showEnd = !hasMore && items.length > 0;

  if (showEmpty) {
    return (
      <div className="px-8 py-14 text-center">
        <p className="text-[15px] leading-6 text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <section className="flex flex-col">
        {items.map((user) => (
          <UserListRow key={user.id} user={user} />
        ))}
      </section>

      {error && (
        <div className="space-y-3 px-4 py-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            再試行
          </button>
        </div>
      )}

      {isLoading && (
        <div className="px-4 py-6 text-center text-sm text-white/60">
          読み込み中...
        </div>
      )}

      {showEnd && (
        <div className="px-4 py-6 text-center text-sm text-white/40">
          {endMessage}
        </div>
      )}

      {hasMore && <div ref={observerRef} className="h-10" aria-hidden="true" />}
    </div>
  );
}
