import { getPostFeedPage } from "@/features/post/server/get-post-feed-page";
import { Cursor, FeedPage } from "@/features/post/types/post.types";

/**
 * 指定したユーザーの返信投稿だけを、カーソルページネーションで取得する。
 *
 * 通常の投稿フィード取得を使い回しつつ、`parentPostId` が存在する投稿に絞ることで
 * ユーザープロフィールの「返信」タブ向けフィードを作る。
 *
 * @param userId 返信投稿を取得する対象ユーザーの ID。
 * @param limit 1 ページあたりの取得件数。未指定時は共通フィード取得側の既定値を使う。
 * @param cursor 次ページ取得時のカーソル。初回取得時は未指定または null。
 * @returns 返信投稿のフィードページ。
 */
export async function getUserRepliesPostFeedPageByUserId({
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
    includeReplies: true,
    where: {
      userId,
      parentPostId: {
        not: null,
      },
    },
  });
}
