"use client";

import { useCallback } from "react";
import UserListRow from "@/features/user/components/UserListRow";
import { fetchUserConnectionsPage } from "@/features/user/client/fetch-user-connections-page";
import {
  FetchUserConnectionsPageInput,
  useInfiniteUserConnections,
} from "@/features/user/hooks/use-infinite-user-connections";
import type { UserConnectionPage } from "@/features/user/types/user.types";

type Props = {
  username: string;
  kind: "followers" | "following";
  initialPage: UserConnectionPage;
  emptyMessage: string;
  endMessage: string;
  pageSize?: number;
};

export default function UserConnectionsList({
  username,
  kind,
  initialPage,
  emptyMessage,
  endMessage,
  pageSize = 20,
}: Props) {
  // タブの種類とユーザー名を固定して、無限スクロール用のページ取得関数に整える。
  const fetchPage = useCallback(
    (input: FetchUserConnectionsPageInput) =>
      fetchUserConnectionsPage({
        username,
        kind,
        ...input,
      }),
    [kind, username],
  );

  // 初期ページを起点に、追加読み込み・リトライ・Intersection Observer の監視をまとめて扱う。
  const {
    items,
    hasMore,
    isLoading,
    error,
    observerRef,
    retry,
  } = useInfiniteUserConnections({
    initialPage,
    fetchPage,
    pageSize,
  });

  // 表示状態を先に名前付けして、JSX 側では「何を出すか」だけを読めるようにする。
  const showEmpty = !isLoading && !error && items.length === 0;
  const showEnd = !hasMore && items.length > 0;

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

      {showEmpty && (
        <div className="px-4 py-10 text-center text-sm text-white/40">
          {emptyMessage}
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

      {/* 画面下に入ると observerRef が反応し、次ページの読み込みが始まる。 */}
      {hasMore && <div ref={observerRef} className="h-10" aria-hidden="true" />}
    </div>
  );
}
