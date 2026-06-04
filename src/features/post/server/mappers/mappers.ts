// src/features/post/server/mappers.ts
import type { FeedItem } from "@/features/post/types/post.types";
import type { PostFeedItemPayload } from "@/features/post/server/selects/selects";

export type ToFeedItemOptions = {
  // 現在ログイン中のユーザーがこの投稿をいいね済みかどうか。
  likedByMe?: boolean;

  // 現在ログイン中のユーザーがこの投稿を削除できるかどうか。
  canDelete?: boolean;

  // 現在ログイン中のユーザー自身の投稿かどうか。
  isOwnPost?: boolean;

  // 現在ログイン中のユーザーが投稿者をフォローしているかどうか。
  isFollowingAuthor?: boolean;
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
    replyTo: post.parentPost
      ? {
          id: post.parentPost.id,
          user: {
            id: post.parentPost.user.id,
            name: post.parentPost.user.name,
            username: post.parentPost.user.username,
          },
        }
      : null,
    viewCount: post.viewCount,
    likeCount: post._count.likes,
    replyCount: post._count.replies,
    likedByMe: options.likedByMe ?? false,
    canDelete: options.canDelete ?? false,
    isOwnPost: options.isOwnPost ?? false,
    isFollowingAuthor: options.isFollowingAuthor ?? false,
  };
}
