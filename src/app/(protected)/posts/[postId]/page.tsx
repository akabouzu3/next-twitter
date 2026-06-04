import {
  BarChart2,
  Bookmark,
  MessageCircle,
  Repeat2,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import LikeButton from "@/features/post/components/LikeButton";
import PostMoreMenu from "@/features/post/components/PostMoreMenu";
import PostImages from "@/features/post/components/PostImages";
import PostComposer from "@/features/post/components/PostComposer";
import PostRepliesPageView from "@/app/(protected)/posts/[postId]/_components/PostRepliesPageView";
import BackButton from "@/components/back-button";
import { getPostDetailAndIncrementViewCount } from "@/features/post/server/get-post-detail";
import { getPostRepliesFeedPage } from "@/features/post/server/get-post-replies-feed-page";
import { requireAuth } from "@/lib/auth/page-guards";

export const metadata: Metadata = {
  title: "ポスト",
};

type Props = {
  params: Promise<{
    postId: string;
  }>;
};

function formatPostDetailDate(date: Date) {
  // 詳細画面では相対時間ではなく、投稿日時を正確に読める形式で表示する。
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function PostDetailPage({ params }: Props) {
  // App Router の params は Promise として渡されるため、Server Component 内で解決する。
  const { postId } = await params;

  // 投稿詳細の取得時に表示回数も更新し、ログイン必須のユーザー情報とは並列で取得する。
  const [post, currentUser] = await Promise.all([
    getPostDetailAndIncrementViewCount(postId),
    requireAuth(),
  ]);

  // 存在しない投稿 ID は Next.js の 404 画面へ委譲する。
  if (!post) {
    notFound();
  }

  const repliesPage = await getPostRepliesFeedPage({
    postId: post.id,
    limit: 10,
  });

  return (
    <>
      {/* ヘッダー: 戻る導線とページタイトル */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-white/10 bg-black/80 px-4 backdrop-blur">
        <BackButton />
        <h1 className="text-xl font-bold">ポスト</h1>
      </header>

      {/* 投稿詳細: 投稿者情報、本文、メディア、投稿日時と表示回数 */}
      <article className="border-b border-white/10 px-4 py-3">
        {/* 投稿者ヘッダー */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/users/${post.user.username}`}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-zinc-700">
              {post.user.image ? (
                <Image
                  src={post.user.image}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
              ) : null}
            </span>

            <span className="min-w-0">
              <span className="block truncate font-bold leading-5 hover:underline">
                {post.user.name}
              </span>
              <span className="block truncate text-sm leading-5 text-white/50">
                @{post.user.username}
              </span>
            </span>
          </Link>

          <PostMoreMenu
            postId={post.id}
            authorId={post.user.id}
            canDelete={post.canDelete}
            isOwnPost={post.isOwnPost}
            isFollowingAuthor={post.isFollowingAuthor}
          />
        </div>

        {post.replyTo ? (
          <Link
            href={`/posts/${post.replyTo.id}`}
            className="mt-4 inline-block text-sm text-white/50 hover:underline"
          >
            返信先: @{post.replyTo.user.username}
          </Link>
        ) : null}

        {/* 投稿本文 */}
        <p className="mt-2 whitespace-pre-wrap text-xl leading-8 text-white">
          {post.content}
        </p>

        {/* 画像がない投稿では、メディア領域自体を描画しない。 */}
        {post.images.length > 0 ? <PostImages post={post} /> : null}

        {/* 投稿日時と表示回数 */}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-white/10 pb-4 text-[15px] text-white/50">
          <time dateTime={post.createdAt.toISOString()}>
            {formatPostDetailDate(post.createdAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>
            <span className="font-bold text-white">
              {post.viewCount.toLocaleString("ja-JP")}
            </span>{" "}
            件の表示
          </span>
        </div>

        {/* 投稿アクション */}
        <div className="grid grid-cols-5 border-b border-white/10 py-1 text-white/50">
          {/* 返信・リポスト・閲覧・保存系は見た目だけ先に置き、実操作は専用実装で追加する。 */}
          <button
            type="button"
            aria-label="返信"
            className="flex h-12 items-center justify-center gap-2 rounded-full transition hover:bg-sky-500/10 hover:text-sky-400"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            <span className="text-sm">{post.replyCount}</span>
          </button>
          <button
            type="button"
            aria-label="リポスト"
            className="flex h-12 items-center justify-center gap-2 rounded-full transition hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Repeat2 className="size-5" aria-hidden="true" />
          </button>
          <div className="flex h-12 items-center justify-center">
            <LikeButton
              postId={post.id}
              initialLiked={post.likedByMe}
              initialLikeCount={post.likeCount}
            />
          </div>
          <button
            type="button"
            aria-label={`${post.viewCount} 件の閲覧`}
            className="flex h-12 items-center justify-center gap-2 rounded-full transition hover:bg-sky-500/10 hover:text-sky-400"
          >
            <BarChart2 className="size-5" aria-hidden="true" />
          </button>
          <div className="flex h-12 items-center justify-center gap-4">
            <button
              type="button"
              aria-label="ブックマーク"
              className="grid size-9 place-items-center rounded-full transition hover:bg-sky-500/10 hover:text-sky-400"
            >
              <Bookmark className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="共有"
              className="grid size-9 place-items-center rounded-full transition hover:bg-sky-500/10 hover:text-sky-400"
            >
              <Share2 className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>

      <section className="border-b border-white/10 px-4 py-4">
        <PostComposer
          currentUser={currentUser}
          parentPostId={post.id}
          placeholder="返信をポスト"
          submitLabel="返信"
          pendingLabel="返信中..."
          variant="reply"
        />
      </section>

      <PostRepliesPageView postId={post.id} repliesPage={repliesPage} />
    </>
  );
}
