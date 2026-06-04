import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { Cursor, FeedItem, FeedPage } from "@/features/post/types/post.types";
import {
  postFeedItemSelect,
  PostFeedItemPayload,
} from "@/features/post/server/selects/selects";
import {
  createFeedItemOptions,
  createFeedItemOptionsContext,
} from "@/features/post/server/create-feed-item-options";
import { toFeedItem } from "@/features/post/server/mappers/mappers";
import { getCurrentUser } from "@/lib/auth/current-user";

const PAGE_SIZE = 10;

type Input = {
  postId: string;
  limit?: number;
  cursor?: Cursor | null;
};

export async function getPostRepliesFeedPage({
  postId,
  limit = PAGE_SIZE,
  cursor,
}: Input): Promise<FeedPage> {
  const replies: PostFeedItemPayload[] = await prisma.post.findMany({
    where: {
      parentPostId: postId,
    },
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: {
            createdAt_id: {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            },
          },
          skip: 1,
        }
      : {}),
    select: postFeedItemSelect,
  });

  const hasMore = replies.length > limit;
  const sliced = hasMore ? replies.slice(0, limit) : replies;
  const lastPost = sliced.at(-1);

  const currentUser = await getCurrentUser();
  const feedItemOptionsContext = await createFeedItemOptionsContext({
    posts: sliced,
    currentUser,
  });
  const items: FeedItem[] = sliced.map((post) =>
    toFeedItem(post, createFeedItemOptions(post, feedItemOptionsContext)),
  );

  return {
    items,
    nextCursor: lastPost
      ? {
          createdAt: lastPost.createdAt.toISOString(),
          id: lastPost.id,
        }
      : null,
    hasMore,
  };
}
