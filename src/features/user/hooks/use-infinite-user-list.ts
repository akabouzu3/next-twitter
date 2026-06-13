"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UserListPage<TItem extends { id: string }, TCursor> = {
  /** 現在ページで取得したユーザー一覧。 */
  items: TItem[];
  /** 次ページ取得に使うカーソル。次ページがない場合は null。 */
  nextCursor: TCursor | null;
  /** 追加取得できるページが残っているかどうか。 */
  hasMore: boolean;
};

/**
 * ユーザー一覧の次ページ取得に渡す入力値。
 */
export type FetchUserListPageInput<TCursor> = {
  /** サーバー側の cursor pagination で次ページの開始位置を示す値。 */
  cursor: TCursor;
  /** 1回のリクエストで取得する最大件数。 */
  limit?: number;
  /** 検索条件の切り替えや unmount 時にリクエストを中断するためのシグナル。 */
  signal?: AbortSignal;
};

type Props<
  TItem extends { id: string },
  TCursor,
  TPage extends UserListPage<TItem, TCursor>,
> = {
  /** Server Component などから渡される初期ページ。 */
  initialPage: TPage;
  /**
   * cursor を受け取り、次ページの items / nextCursor / hasMore を返す取得関数。
   *
   * hook 側で AbortSignal を渡すため、fetch 実装では signal をそのまま利用する。
   */
  fetchPage: (input: FetchUserListPageInput<TCursor>) => Promise<TPage>;
  /** 追加取得時のページサイズ。未指定の場合は 20 件。 */
  pageSize?: number;
  /** 追加取得に失敗したとき UI に表示するメッセージ。 */
  errorMessage: string;
};

/**
 * id をキーにユーザー一覧をマージし、追加取得時の重複を取り除く。
 */
function mergeUniqueItems<TItem extends { id: string }>(
  prev: TItem[],
  next: TItem[],
) {
  // 追加取得中に同じユーザーが混ざっても、id 単位で上書きして一覧の重複を防ぐ。
  const map = new Map<string, TItem>();

  for (const item of prev) {
    map.set(item.id, item);
  }

  for (const item of next) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

/**
 * ユーザー検索・フォロー一覧・フォロワー一覧などで共有する無限スクロール用 hook。
 *
 * 初期ページを表示し、末尾の sentinel が近づいたら cursor pagination で次ページを取得する。
 */
export function useInfiniteUserList<
  TItem extends { id: string },
  TCursor,
  TPage extends UserListPage<TItem, TCursor>,
>({
  initialPage,
  fetchPage,
  pageSize = 20,
  errorMessage,
}: Props<TItem, TCursor, TPage>) {
  // initialPage は Server Component から渡された最初のページ。
  // 以降のページだけを client fetch で継ぎ足す。
  const [items, setItems] = useState<TItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<TPage["nextCursor"]>(
    initialPage.nextCursor,
  );
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 検索語、プロフィール、タブなどが切り替わって initialPage が変わったら、
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
      setError(errorMessage);
    } finally {
      // より新しいリクエストが走っている場合は、その controller を消さない。
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [errorMessage, fetchPage, hasMore, nextCursor, pageSize]);

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
