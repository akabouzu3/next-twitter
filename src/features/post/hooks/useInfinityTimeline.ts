"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchTimelinePage } from "@/features/post/client/fetch-timeline-page";
import { FeedItem, FeedPage } from "@/features/post/types/post.types";

/**
 * 投稿配列を id ベースでマージしつつ重複を除去する
 *
 * 無限スクロールでは以下のようなケースで重複が起きる:
 * - 同じページが2回取得される
 * - cursorがズレた状態で取得される
 *
 * Mapを使うことで O(n) で一意化できる
 */
function mergeUniquePosts(prev: FeedItem[], next: FeedItem[]) {
  const map = new Map<string, FeedItem>();

  // 既存データを先に入れる
  for (const post of prev) {
    map.set(post.id, post);
  }

  // 新規データを上書き的に追加
  for (const post of next) {
    map.set(post.id, post);
  }

  // Map → Array
  return Array.from(map.values());
}

/**
 * サーバーから渡されたページデータを
 * useState の初期値に変換する関数
 *
 * → フックの責務をシンプルに保つために分離
 */
function createInitialState(timelinePage: FeedPage) {
  return {
    posts: timelinePage.items,
    nextCursor: timelinePage.nextCursor,
    hasMore: timelinePage.hasMore,
  };
}

/**
 * 無限スクロール（cursor pagination）を扱うカスタムフック
 *
 * 責務:
 * - 投稿リストの状態管理
 * - 次ページ取得
 * - IntersectionObserver管理
 * - 通信キャンセル
 * - エラーハンドリング
 */
export function useInfiniteTimeline(timelinePage: FeedPage) {
  /**
   * 初期値をメモ化
   * timelinePage が変わった時のみ再計算
   */
  const initialState = useMemo(
    () => createInitialState(timelinePage),
    [timelinePage]
  );

  const [posts, setPosts] = useState<FeedItem[]>(initialState.posts);
  const [nextCursor, setNextCursor] = useState<FeedPage["nextCursor"]>(
    initialState.nextCursor
  );
  const [hasMore, setHasMore] = useState(initialState.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * IntersectionObserver の監視対象DOM
   * この要素が画面内に入ると loadMore が発火する
   */
  const observerRef = useRef<HTMLDivElement | null>(null);

  /**
   * 二重取得防止用フラグ（重要）
   *
   * useState だけだと setState が反映されるまでの間に
   * observer が複数回発火する可能性があるため、
   * ref で即時判定する
   */
  const isLoadingRef = useRef(false);

  /**
   * 現在進行中のリクエスト管理
   *
   * - 新しいリクエスト開始時に前のリクエストを中断
   * - コンポーネント破棄時にも中断
   */
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 親から新しい timelinePage が来た時に state をリセット
   *
   * 主なケース:
   * - router.refresh()
   * - フィルタ変更
   * - 初期データ再取得
   */
  useEffect(() => {
    const next = createInitialState(timelinePage);

    setPosts(next.posts);
    setNextCursor(next.nextCursor);
    setHasMore(next.hasMore);
    setError(null);

    // 古いリクエストを中断
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    // ローディング状態もリセット
    isLoadingRef.current = false;
    setIsLoading(false);
  }, [timelinePage]);

  /**
   * 次ページ取得関数
   *
   * useCallback により再生成を防ぐ
   */
  const loadMore = useCallback(async () => {
    // 二重リクエスト防止
    if (isLoadingRef.current) return;

    // もう続きがない場合
    if (!hasMore) return;

    // cursorがない場合
    if (!nextCursor) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    // 既存リクエストをキャンセル
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      /**
       * APIから次ページ取得
       */
      const data = await fetchTimelinePage({
        cursor: nextCursor,
        signal: controller.signal,
      });

      /**
       * 投稿をマージ（重複除去）
       */
      setPosts((prev) => mergeUniquePosts(prev, data.items));

      /**
       * 次ページ情報更新
       */
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      /**
       * Abortは正常ケースなので無視
       */
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error(error);
      setError("投稿の読み込みに失敗しました");
    } finally {
      /**
       * 自分が発行したリクエストならリセット
       */
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, nextCursor]);

  /**
   * IntersectionObserver 設定
   *
   * - 画面下の要素が見えたら loadMore 実行
   * - rootMargin を広めに取って先読み
   */
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    // 続きがない場合は監視不要
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // 画面内に入ったら発火
        if (!entry?.isIntersecting) return;

        void loadMore();
      },
      {
        root: null,
        rootMargin: "300px 0px", // 早めに読み込む
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  /**
   * コンポーネント破棄時に通信をキャンセル
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * 手動再試行用
   *
   * エラー時などに使う
   */
  const retry = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  /**
   * UIで使う値を返す
   */
  return {
    posts,
    nextCursor,
    hasMore,
    isLoading,
    error,
    observerRef,
    loadMore,
    retry,
  };
}