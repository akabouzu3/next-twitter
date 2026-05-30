// src/features/post/server/mappers.ts
import type { FeedItem } from "@/features/post/types/post.types";
import type { PostFeedItemPayload } from "@/features/post/server/selects/selects";

type ToFeedItemOptions = {
  // 現在ログイン中のユーザーがこの投稿をいいね済みかどうか。
  likedByMe?: boolean;
};

/**
 * DB取得用の投稿shapeを、フィードUIで使う形へ変換する。
 */
export function toFeedItem(
  post: PostFeedItemPayload,
  options: ToFeedItemOptions = {},
): FeedItem {
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
    likedByMe: options.likedByMe ?? false,
  };
}
