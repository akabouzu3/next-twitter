"use client";

import Feed from "@/features/post/components/FeedItem";
import { useInfiniteTimeline } from "@/features/post/hooks/useInfinityTimeline";
import { FeedPage } from "@/features/post/types/post.types";

type Props = {
  feedPage: FeedPage;
};

export default function FeedList({ feedPage }: Props) {
  const {
    posts,
    hasMore,
    isLoading,
    error,
    observerRef,
    retry,
  } = useInfiniteTimeline(feedPage);

  const showEmpty = !isLoading && !error && posts.length === 0;
  const showEnd = !hasMore && posts.length > 0;

  return (
    <div>
      <section className="flex flex-col">
        {posts.map((post) => (
          <Feed key={post.id} post={post} />
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
          投稿はまだありません
        </div>
      )}

      {isLoading && (
        <div className="px-4 py-6 text-center text-sm text-white/60">
          読み込み中...
        </div>
      )}

      {showEnd && (
        <div className="px-4 py-6 text-center text-sm text-white/40">
          これ以上投稿はありません
        </div>
      )}

      {hasMore && <div ref={observerRef} className="h-10" aria-hidden="true" />}
    </div>
  );
}