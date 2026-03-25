import { FeedItem as FeedItemType } from "@/features/post/types/feed";
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import PostImages from "@/features/post/components/PostImages";
import { formatRelativeTime } from "@/lib/utils/date";

type Props = {
  post: FeedItemType;
};

export default function FeedItem({ post }: Props) {
  return (
    <article className="border-b border-white/10 px-4 py-3">
      <div className="flex gap-3">
        <Image
          src={post.user.image ?? ""}
          alt={post.user.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="truncate font-bold">{post.user.name}</span>
            {/* {post.author.verified && <CheckCircle2 className="size-4 fill-sky-500 text-sky-500" />} */}
            <span className="truncate text-white/50">@{post.user.username}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/50">{ formatRelativeTime(post.createdAt) }</span>
          </div>

          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-6">
            {post.content}
          </p>

          <PostImages post={post}/>

          <div className="mt-3 grid grid-cols-6 text-white/50">
            <button className="flex items-center gap-2"><MessageCircle className="size-4" />{10}</button>
            <button className="flex items-center gap-2"><Repeat2 className="size-4" />{10}</button>
            <button className="flex items-center gap-2"><Heart className="size-4" />{post.likeCount}</button>
            <button className="flex items-center gap-2"><BarChart2 className="size-4" />{10}</button>
            <button className="flex items-center gap-2"><Bookmark className="size-4" /></button>
            <button className="flex items-center gap-2"><Share2 className="size-4" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}