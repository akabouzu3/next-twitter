import { FeedItem as FeedItemType } from "@/features/post/types/post.types";
import {
  MessageCircle, BarChart2,
  // CheckCircle2
 } from "lucide-react";
import Image from "next/image";
import PostImages from "@/features/post/components/PostImages";
import { formatRelativeTime } from "@/lib/utils/date";
import Link from "next/link";
import LikeButton from "@/features/post/components/LikeButton";
import PostMoreMenu from "@/features/post/components/PostMoreMenu";
import { getUserImageUrl } from "@/lib/utils/default-user-images";

type Props = {
  post: FeedItemType;
};

export default function FeedItem({ post }: Props) {
  const postHref = `/posts/${post.id}`;
  const userImageUrl = getUserImageUrl(post.user.image);

  return (
    <article className="relative border-b border-white/10 px-4 py-3 transition hover:bg-white/[0.03]">
      {/* 投稿詳細リンクは背面の透明レイヤーとして敷き、記事の空き領域クリックで詳細へ遷移させる。 */}
      <Link
        href={postHref}
        aria-label="投稿詳細を表示"
        className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
      />

      {/* 本文側は前面に置くが、親はクリックを透過して空き領域のクリックを背面リンクへ流す。 */}
      <div className="pointer-events-none relative z-10 flex gap-3">
        <Link
          href={`/users/${post.user.username}`}
          className="pointer-events-auto size-10 shrink-0 overflow-hidden rounded-full bg-zinc-700"
        >
          <Image
            src={userImageUrl}
            alt={post.user.name}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between">
            <div className="flex items-center gap-1 text-sm">
              <span className="truncate font-bold">{post.user.name}</span>
              {/* {post.author.verified && <CheckCircle2 className="size-4 fill-sky-500 text-sky-500" />} */}
              <span className="truncate text-white/50">@{post.user.username}</span>
              <span className="text-white/50">·</span>
              <span className="text-white/50">{formatRelativeTime(post.createdAt)}</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-1">
              <PostMoreMenu
                postId={post.id}
                authorId={post.user.id}
                canDelete={post.canDelete}
                isOwnPost={post.isOwnPost}
                isFollowingAuthor={post.isFollowingAuthor}
              />
            </div>
          </div>

          {post.replyTo ? (
            <Link
              href={`/posts/${post.replyTo.id}`}
              className="pointer-events-auto mt-1 block text-sm text-white/50 hover:underline"
            >
              返信先: @{post.replyTo.user.username}
            </Link>
          ) : null}

          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-6">
            {post.content}
          </p>

          {post.images.length > 0 ? (
            <PostImages post={post}/>
          ) : null}

          <div className="mt-3 flex items-center gap-16 text-white/50">
            <Link
              href={postHref}
              aria-label={`${post.replyCount} 件の返信`}
              className="pointer-events-auto flex items-center gap-2 hover:text-sky-400"
            >
              <MessageCircle className="size-4" />
              {post.replyCount}
            </Link>
            <span className="pointer-events-auto">
              <LikeButton
                postId={post.id}
                initialLiked={post.likedByMe}
                initialLikeCount={post.likeCount}
              />
            </span>
            <button
              type="button"
              className="pointer-events-auto flex items-center gap-2"
              aria-label={`${post.viewCount} 件の閲覧`}
            >
              <BarChart2 className="size-4" aria-hidden="true" />
              {post.viewCount}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
