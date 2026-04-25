"use client";

import Feed from "@/features/post/components/FeedItem";
import { useInfiniteFeed, FetchPageInput } from "@/features/post/hooks/useInfinityFeed";
import { FeedPage } from "@/features/post/types/post.types";

type Props = {
  initialPage: FeedPage;
  fetchPage: (input: FetchPageInput) => Promise<FeedPage>; 
}

export default function FeedList({ initialPage, fetchPage }: Props) {
  /**
   * カスタムフックから状態と操作を取得
   *
   * - posts: 現在表示している投稿一覧
   * - hasMore: まだ続きがあるか
   * - isLoading: 次ページ取得中か
   * - error: エラー状態
   * - observerRef: 無限スクロール監視用DOM
   * - retry: エラー時の再試行
   */
  const {
    items,
    hasMore,
    isLoading,
    error,
    observerRef,
    retry,
  } = useInfiniteFeed({ initialPage, fetchPage, pageSize: 20 });

  /**
   * 空状態の表示条件
   *
   * - 読み込み中ではない
   * - エラーでもない
   * - 投稿が0件
   */
  const showEmpty = !isLoading && !error && items.length === 0;

  /**
   * 終端表示条件（これ以上データがない）
   *
   * - hasMore が false
   * - 投稿が1件以上ある
   */
  const showEnd = !hasMore && items.length > 0;

  return (
    <div>
      {/* ========================
          投稿一覧
         ======================== */}
      <section className="flex flex-col">
        {items.map((post) => (
          <Feed key={post.id} post={post} />
        ))}
      </section>

      {/* ========================
          エラー表示
         ======================== */}
      {error && (
        <div className="space-y-3 px-4 py-4 text-center">
          <p className="text-sm text-red-400">{error}</p>

          {/* 再試行ボタン */}
          <button
            type="button"
            onClick={retry}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            再試行
          </button>
        </div>
      )}

      {/* ========================
          空状態（投稿が1件もない）
         ======================== */}
      {showEmpty && (
        <div className="px-4 py-10 text-center text-sm text-white/40">
          投稿はまだありません
        </div>
      )}

      {/* ========================
          ローディング表示
         ======================== */}
      {isLoading && (
        <div className="px-4 py-6 text-center text-sm text-white/60">
          読み込み中...
        </div>
      )}

      {/* ========================
          最後まで読み切った表示
         ======================== */}
      {showEnd && (
        <div className="px-4 py-6 text-center text-sm text-white/40">
          これ以上投稿はありません
        </div>
      )}

      {/* ========================
          無限スクロール監視用ターゲット
         ======================== */}
      {hasMore && (
        /**
         * この要素が画面内に入ると
         * useInfiniteTimeline 内の IntersectionObserver が発火して
         * loadMore() が実行される
         *
         * aria-hidden はアクセシビリティ対策（読み上げ対象外）
         */
        <div ref={observerRef} className="h-10" aria-hidden="true" />
      )}
    </div>
  );
}