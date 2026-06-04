import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import PostComposer from "@/features/post/components/PostComposer";
import PostDetailArticle from "@/app/(protected)/posts/[postId]/_components/PostDetailArticle";
import PostDetailHeader from "@/app/(protected)/posts/[postId]/_components/PostDetailHeader";
import PostRepliesSection from "@/app/(protected)/posts/[postId]/_components/PostRepliesSection";
import FeedListLoading from "@/features/post/components/FeedListLoading";
import { getPostDetailAndIncrementViewCount } from "@/features/post/server/get-post-detail";
import { requireAuth } from "@/lib/auth/page-guards";

export const metadata: Metadata = {
  title: "ポスト",
};

type Props = {
  params: Promise<{
    postId: string;
  }>;
};

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

  return (
    <>
      <PostDetailHeader />
      <PostDetailArticle post={post} />

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

      <Suspense fallback={<FeedListLoading />}>
        <PostRepliesSection postId={post.id} />
      </Suspense>
    </>
  );
}
