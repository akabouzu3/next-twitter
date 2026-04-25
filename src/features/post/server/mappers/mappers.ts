// src/features/post/server/mappers.ts
import type { FeedItem } from "@/features/post/types/post.types";
import type { FeedPostItemPayload } from "@/features/post/server/selects/selects";

export function toFeedItem(post: FeedPostItemPayload): FeedItem {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    user: {
      id: post.user.id,
      name: post.user.name,
      username: post.user.username,
      image: post.user.image,
    },
    images: post.images.map((image) => ({
      id: image.id,
      url: image.url,
    })),
    likeCount: post._count.likes,
  };
}