
import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";

/**
 * 投稿カード用の user 情報
 */
const postAuthorSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  username: true,
  image: true,
});

/**
 * ユーザー詳細画面の投稿一覧で使う投稿データ
 * - 必要な項目だけ select する
 * - あとで UI にそのまま渡しやすい shape にする
 */
export const userPostItemSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,

  user: {
    select: postAuthorSelect,
  },

  _count: {
    select: {
      likes: true,
      // comments: true,
    },
  },

  // 画像投稿があるなら使う
  images: {
    select: {
      id: true,
      url: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
});

export type UserPostItem = Prisma.PostGetPayload<{
  select: typeof userPostItemSelect;
}>;

type GetUserPostsByUsernameInput = {
  username: string;
  limit?: number;
  cursor?: string;
};

/**
 * username からそのユーザーの投稿一覧を取得する
 *
 * - まず User を username で引いて id を取得
 * - その後 Post を userId で取得
 * - cursor がある場合は次ページを返す
 */
export async function getUserPostsByUsername({
  username,
  limit = 10,
  cursor,
}: GetUserPostsByUsernameInput): Promise<UserPostItem[]> {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return [];
  }

  return prisma.post.findMany({
    where: {
      userId: user.id,
    },
    select: userPostItemSelect,
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          id: cursor,
        }
      : undefined,
  });
}