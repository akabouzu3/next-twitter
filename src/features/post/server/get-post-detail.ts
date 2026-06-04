import "server-only";

import { Prisma } from "@prisma/client";

import {
  createFeedItemOptions,
  createFeedItemOptionsContext,
} from "@/features/post/server/create-feed-item-options";
import { toFeedItem } from "@/features/post/server/mappers/mappers";
import { postFeedItemSelect } from "@/features/post/server/selects/selects";
import type { FeedItem } from "@/features/post/types/post.types";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma/prisma";

export async function getPostDetailAndIncrementViewCount(
  postId: string,
): Promise<FeedItem | null> {
  try {
    /**
     * 投稿詳細ページを開いたタイミングで閲覧数を加算する。
     *
     * findUnique → update の2回に分けると、存在確認と加算の間に状態が変わる余地があるため、
     * update 1回で「存在する投稿の取得」と「viewCount の +1」をまとめて行う。
     */
    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: postFeedItemSelect,
    });

    const currentUser = await getCurrentUser();
    const feedItemOptionsContext = await createFeedItemOptionsContext({
      posts: [post],
      currentUser,
    });

    return toFeedItem(post, createFeedItemOptions(post, feedItemOptionsContext));
  } catch (error) {
    /**
     * Prisma の update は対象レコードが存在しない場合 P2025 を投げる。
     * ここでは「投稿がない」を呼び出し元の notFound() に渡せるよう null に変換する。
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
}
