import { getPostFeedPage } from "@/features/post/server/get-post-feed-page";
import { Cursor, FeedPage } from "@/features/post/types/post.types";
// import { getUserByUsername } from "@/features/user/server/get-user";

export async function getUserMediaPostFeedPageByUserId({
  userId,
  limit,
  cursor,
}: {
  userId: string;
  limit?: number;
  cursor?: Cursor | null;
}): Promise<FeedPage> {

  return getPostFeedPage({
    limit,
    cursor,
    where: {
      userId,
      images: { some: {}}
    },
  });
}