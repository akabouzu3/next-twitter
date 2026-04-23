"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FeedItem, FeedPage, Cursor } from "@/features/post/types/post.types";

/**
 * 投稿配列を id ベースでマージしつつ重複を除去する
 *
 * 無限スクロールでは以下のようなケースで重複が起きる:
 * - 同じページが2回取得される
 * - cursorがズレた状態で取得される
 *
 * Mapを使うことで O(n) で一意化できる
 */
function mergeUniqueItems(prev: FeedItem[], next: FeedItem[]) {
  const map = new Map<string, FeedItem>();

  // 既存データを先に入れる
  for (const item of prev) {
    map.set(item.id, item);
  }

  // 新規データを上書き的に追加
  for (const item of next) {
    map.set(item.id, item);
  }

  // Map → Array
  return Array.from(map.values());
}

type FetchPageInput = {
  cursor: Cursor; // 次ページ取得用カーソル
  limit?: number;                 // 取得件数（任意）
  signal?: AbortSignal;           // fetchキャンセル用（React Query等で重要）
};

type Props = {
  initialPage: FeedPage;
  fetchPage: (input: FetchPageInput) => Promise<FeedPage>; 
  pageSize?: number;
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
export function useInfiniteFeed({
  initialPage,
  fetchPage,
  pageSize = 10,
}: Props) {

  const [items, setItems] = useState<FeedItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<FeedPage["nextCursor"]>(
    initialPage.nextCursor
  );
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  /**
   * ローディング状態（UI表示用）
   */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * IntersectionObserver の監視対象DOM
   * この要素が画面内に入ると loadMore が発火する
   */
  const observerRef = useRef<HTMLDivElement | null>(null);

  /**
   * ローディング状態（ロジック用）：二重取得防止用フラグ（重要）
   *
   * useState だけだと setState が反映されるまでの間に
   * observer が複数回発火する可能性があるため、
   * ref で即時判定する
   * isLoadingRef.current = ture; は同期的に即時更新出来る
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

    setItems(initialPage.items);
    setNextCursor(initialPage.nextCursor);
    setHasMore(initialPage.hasMore);
    setError(null);

    // 古いリクエストを中断
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    // ローディング状態もリセット
    isLoadingRef.current = false;
    setIsLoading(false);
  }, [initialPage]);

  /**
   * 次ページ取得関数
   *
   * useCallback により再生成を防ぐ
   */
  const loadMore = useCallback(async () => {
    // 二重リクエスト防止（取得中の場合、新しいリクエストを投げない）
    if (isLoadingRef.current) return;

    // もう続きがない場合
    if (!hasMore) return;

    // cursorがない場合
    if (!nextCursor) return;


    // ローディング開始：次ページの取得行動に入る
    isLoadingRef.current = true;
    setIsLoading(true);

    // 前回のエラーをリセット
    setError(null);

    // 既存リクエストをキャンセル
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      /**
       * APIから次ページ取得
       */
      const data = await fetchPage({
        cursor: nextCursor,
        limit: pageSize,
        signal: controller.signal,
      });

      /**
       * 投稿をマージ（重複除去）
       */
      setItems((prev) => mergeUniqueItems(prev, data.items));

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
  }, [hasMore, nextCursor, fetchPage]);

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
        const entry: IntersectionObserverEntry = entries[0];

        // 画面に要素が交際してない場合、終了
        if (!entry?.isIntersecting) return;

        void loadMore();
      },
      {
        root: null, // 画面のビューポートを基準にする（画面に要素が見えたら発火）
        rootMargin: "300px 0px", // 300px手前で当たり判定する
        threshold: 0, // 要素が少しでも交差したら発火（0~1）
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
    items,
    nextCursor,
    hasMore,
    isLoading,
    error,
    observerRef,
    loadMore,
    retry,
  };
}