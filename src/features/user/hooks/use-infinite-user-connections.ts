"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  UserConnectionCursor,
  UserConnectionItem,
  UserConnectionPage,
} from "@/features/user/types/user.types";

function mergeUniqueItems(
  prev: UserConnectionItem[],
  next: UserConnectionItem[],
) {
  // 追加取得中に同じユーザーが混ざっても、id 単位で上書きして一覧の重複を防ぐ。
  const map = new Map<string, UserConnectionItem>();

  for (const item of prev) {
    map.set(item.id, item);
  }

  for (const item of next) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

export type FetchUserConnectionsPageInput = {
  cursor: UserConnectionCursor;
  limit?: number;
  signal?: AbortSignal;
};

type Props = {
  initialPage: UserConnectionPage;
  fetchPage: (
    input: FetchUserConnectionsPageInput,
  ) => Promise<UserConnectionPage>;
  pageSize?: number;
};

export function useInfiniteUserConnections({
  initialPage,
  fetchPage,
  pageSize = 20,
}: Props) {
  // initialPage は Server Component から渡された最初のページ。
  // 以降のページだけを client fetch で継ぎ足す。
  const [items, setItems] = useState<UserConnectionItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<UserConnectionPage["nextCursor"]>(
    initialPage.nextCursor,
  );
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // プロフィールやタブが切り替わって initialPage が変わったら、
    // 古い追加取得を止めて一覧状態を初期ページに戻す。
    setItems(initialPage.items);
    setNextCursor(initialPage.nextCursor);
    setHasMore(initialPage.hasMore);
    setError(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    isLoadingRef.current = false;
    setIsLoading(false);
  }, [initialPage]);

  const loadMore = useCallback(async () => {
    // 連続発火・最終ページ到達・cursor 未確定のときは追加取得しない。
    if (isLoadingRef.current) return;
    if (!hasMore) return;
    if (!nextCursor) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    abortControllerRef.current?.abort();

    // 新しい追加取得を始める前に AbortController を作り直し、
    // 後続の切り替えや unmount から中断できるようにする。
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await fetchPage({
        cursor: nextCursor,
        limit: pageSize,
        signal: controller.signal,
      });

      // API は次ページ分だけ返すので、既存一覧へ重複排除しながら継ぎ足す。
      setItems((prev) => mergeUniqueItems(prev, data.items));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error(error);
      setError("ユーザー一覧の読み込みに失敗しました");
    } finally {
      // より新しいリクエストが走っている場合は、その controller を消さない。
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchPage, hasMore, nextCursor, pageSize]);

  useEffect(() => {
    // 末尾の sentinel が近づいたら次ページを読み込む。
    // rootMargin を広めに取り、ユーザーが末尾へ到達する前に先読みする。
    const target = observerRef.current;
    if (!target) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        void loadMore();
      },
      {
        root: null,
        rootMargin: "500px 0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const retry = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  return {
    items,
    hasMore,
    isLoading,
    error,
    observerRef,
    retry,
  };
}
