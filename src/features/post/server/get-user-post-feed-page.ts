import { getPostFeedPage } from "@/features/post/server/get-post-feed-page";
import { Cursor, FeedPage } from "@/features/post/types/post.types";
import { getUserByUsername } from "@/features/user/server/get-user";

export async function getUserPostFeedPageByUserId({
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
    },
  });
}


export async function getUserPostFeedPageByUsername({
  username,
  limit,
  cursor,
}: {
  username: string;
  limit?: number;
  cursor?: Cursor | null;
}): Promise<FeedPage> {

  const user = await getUserByUsername(username);

  if(!user) {
    throw new Error("userを取得できませんでした。");
  }

  return getPostFeedPage({
    limit,
    cursor,
    where: {
      userId: user.id,
    },
  });
}