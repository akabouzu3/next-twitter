import { TimelineItem } from "@/features/post/types/timeline";
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type Props = {
  post: TimelineItem;
};

export default function FeedItem({ post }: Props) {
  return (
    <article className="border-b border-white/10 px-4 py-3">
      <div className="flex gap-3">
        <Image
          src={post.author.avatarUrl}
          alt={post.author.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="truncate font-bold">{post.author.name}</span>
            {post.author.verified && <CheckCircle2 className="size-4 fill-sky-500 text-sky-500" />}
            <span className="truncate text-white/50">@{post.author.username}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/50">{post.createdAt}</span>
          </div>

          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-6">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                <Image
                src={post.imageUrl}
                  alt=""
                  width={800}
                  height={450}
                  className="h-auto w-full object-cover"
                />
              </div>
          )}

          <div className="mt-3 grid grid-cols-6 text-white/50">
            <button className="flex items-center gap-2"><MessageCircle className="size-4" />{post.stats.replies}</button>
            <button className="flex items-center gap-2"><Repeat2 className="size-4" />{post.stats.reposts}</button>
            <button className="flex items-center gap-2"><Heart className="size-4" />{post.stats.likes}</button>
            <button className="flex items-center gap-2"><BarChart2 className="size-4" />{post.stats.views}</button>
            <button className="flex items-center gap-2"><Bookmark className="size-4" /></button>
            <button className="flex items-center gap-2"><Share2 className="size-4" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}