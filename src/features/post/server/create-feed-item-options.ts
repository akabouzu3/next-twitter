import "server-only";

import type { CurrentUser } from "@/lib/auth/current-user";
import { canDeletePost, isPostOwner } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma/prisma";
import type { ToFeedItemOptions } from "@/features/post/server/mappers/mappers";
import type { PostFeedItemPayload } from "@/features/post/server/selects/selects";

type Input = {
  posts: PostFeedItemPayload[];
  currentUser: CurrentUser | null;

  /**
   * 呼び出し元でフォロー中ユーザーIDを解決済みの場合に渡す。
   * 例: フォロー中ユーザーだけを表示するフィードでは、追加クエリを避けられる。
   */
  followedAuthorIdSet?: ReadonlySet<string>;
};

export type FeedItemOptionsContext = {
  currentUser: CurrentUser | null;
  likedPostIdSet: ReadonlySet<string>;
  followedAuthorIdSet: ReadonlySet<string>;
};

/**
 * 指定ユーザーがいいね済みの投稿ID一覧を Set で返す。
 *
 * フィード1ページ分の投稿IDだけをまとめて調べることで、
 * 投稿ごとの個別クエリを避ける。
 *
 * userId だけで検索すると、そのユーザーが過去にいいねした全投稿が対象になる。
 * 画面表示に必要なのは現在のページ内投稿のいいね状態だけなので、
 * postIds で対象を絞り、取得件数を抑える。
 */
async function getLikedPostIdSet({
  userId,
  postIds,
}: {
  userId: string | null;
  postIds: string[];
}): Promise<Set<string>> {
  if (!userId || postIds.length === 0) {
    return new Set();
  }

  const likes = await prisma.postLike.findMany({
    where: {
      userId,
      postId: {
        in: postIds,
      },
    },
    select: {
      postId: true,
    },
  });

  return new Set(likes.map((like) => like.postId));
}

/**
 * フィード内の投稿者のうち、現在ユーザーがフォローしているユーザーIDを取得する。
 *
 * 投稿ごとに follow を確認すると N+1 クエリになるため、表示対象の投稿者IDをまとめて抽出し、
 * `follow.findMany` 1回でフォロー状態を解決する。
 */
async function getFollowedAuthorIdSet({
  posts,
  currentUserId,
}: {
  posts: PostFeedItemPayload[];
  currentUserId: string | null;
}): Promise<Set<string>> {
  if (!currentUserId || posts.length === 0) {
    return new Set();
  }

  const authorIds = [
    ...new Set(
      posts
        .map((post) => post.user.id)
        .filter((authorId) => authorId !== currentUserId),
    ),
  ];

  if (authorIds.length === 0) {
    return new Set();
  }

  const followedAuthors = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
      followingId: {
        in: authorIds,
      },
    },
    select: {
      followingId: true,
    },
  });

  return new Set(followedAuthors.map((follow) => follow.followingId));
}

/**
 * FeedItem 変換時に必要な「現在ユーザー基準の状態」をまとめて解決し、
 * 投稿ごとの ToFeedItemOptions を作るための context を返す。
 *
 * ■ 解決する状態
 * - 現在ユーザーがいいね済みか
 * - 現在ユーザーが削除できる投稿か
 * - 現在ユーザー自身の投稿か
 * - 現在ユーザーが投稿者をフォローしているか
 *
 * ■ 設計ポイント
 * - liked / follow の状態は投稿一覧全体で一括取得し、mapper 実行時の追加DBアクセスを防ぐ
 * - 権限判定は `canDeletePost` に閉じ込め、UI用の boolean だけを返す
 * - 未ログイン時はすべて安全側の false になる
 */
export async function createFeedItemOptionsContext({
  posts,
  currentUser,
  followedAuthorIdSet,
}: Input): Promise<FeedItemOptionsContext> {
  const currentUserId = currentUser?.id ?? null;

  /**
   * いいね状態とフォロー状態は互いに依存しないため並列で解決する。
   * `followedAuthorIdSet` が渡されている場合は、呼び出し元の既知情報を再利用する。
   */
  const [likedPostIdSet, resolvedFollowedAuthorIdSet] = await Promise.all([
    getLikedPostIdSet({
      userId: currentUserId,
      postIds: posts.map((post) => post.id),
    }),
    followedAuthorIdSet
      ? Promise.resolve(followedAuthorIdSet)
      : getFollowedAuthorIdSet({ posts, currentUserId }),
  ]);

  return {
    currentUser,
    likedPostIdSet,
    followedAuthorIdSet: resolvedFollowedAuthorIdSet,
  };
}

/**
 * 投稿1件と事前に解決済みの context から ToFeedItemOptions を作る。
 *
 * mapper 側ではDBや認証情報に触れず、ここで解決済みの状態だけを参照する。
 */
export function createFeedItemOptions(
  post: PostFeedItemPayload,
  context: FeedItemOptionsContext,
): ToFeedItemOptions {
  const postOwnerLike = { userId: post.user.id };

  return {
    likedByMe: context.likedPostIdSet.has(post.id),
    canDelete: context.currentUser
      ? canDeletePost(context.currentUser, postOwnerLike)
      : false,
    isOwnPost: context.currentUser
      ? isPostOwner(context.currentUser, postOwnerLike)
      : false,
    isFollowingAuthor:
      context.currentUser !== null &&
      !isPostOwner(context.currentUser, postOwnerLike) &&
      context.followedAuthorIdSet.has(post.user.id),
  };
}
