import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
import type {
  UserSearchCursor,
  UserSearchPage,
} from "@/features/user/types/user.types";
import { userListUserSelect } from "@/features/user/server/selects/selects";
import { toUserListItem } from "@/features/user/server/mappers/mappers";
import {
  createUserListItemOptions,
  createUserListItemOptionsContext,
} from "@/features/user/server/create-user-list-item-options";

const DEFAULT_USER_SEARCH_PAGE_SIZE = 20;

type GetUserSearchPageInput = {
  query: string;
  limit?: number;
  cursor?: UserSearchCursor | null;
};

/**
 * アカウント検索用の Prisma where 条件を作る。
 *
 * 検索対象は表示名、ユーザー名、bio。
 * cursor pagination の位置指定は Prisma の `cursor` / `skip` で行うため、
 * この関数は検索語による絞り込みだけを担当する。
 */
function createSearchWhere(query: string): Prisma.UserWhereInput {
  /**
   * まず「検索語に一致するユーザー」の条件を作る。
   *
   * `mode: "insensitive"` は大文字 / 小文字を区別しない検索にするための指定。
   */
  const searchWhere = {
    OR: [
      {
        name: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
      {
        username: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
      {
        bio: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
    ],
  };

  return searchWhere;
}

/**
 * アカウント検索結果の1ページを cursor pagination で取得する。
 *
 * ■ ページング方針
 * - unique な `username ASC` の安定順で取得する
 * - `limit + 1` 件取得し、1件余分に取れたら次ページありと判定する
 * - 次ページの cursor は、今回返した最後のユーザーの `username`
 *
 * ■ mapper 方針
 * - DB からは一覧表示に必要な user shape だけ取得する
 * - フォロー状態や自分自身かどうかは options context でまとめて解決する
 * - mapper 自体は DB / session に触れない
 */
export async function getUserSearchPage({
  query,
  limit = DEFAULT_USER_SEARCH_PAGE_SIZE,
  cursor,
}: GetUserSearchPageInput): Promise<UserSearchPage> {
  const currentUserId = await getCurrentSessionUserId();
  const normalizedQuery = query.trim();

  if (!currentUserId || normalizedQuery.length === 0) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  /**
   * limit + 1 件取得して、次ページの有無を判定する。
   *
   * offset pagination ではなく cursor pagination にすることで、
   * 追加読み込み中にデータが増減しても重複や抜けが起きにくい。
   */
  const users = await prisma.user.findMany({
    where: createSearchWhere(normalizedQuery),
    select: userListUserSelect,
    orderBy: {
      username: "asc",
    },
    ...(cursor
      ? {
          cursor: {
            username: cursor.username,
          },
          skip: 1,
        }
      : {}),
    take: limit + 1,
  });

  const hasMore = users.length > limit;
  const sliced = hasMore ? users.slice(0, limit) : users;

  /**
   * 検索結果1ページ分に対する現在ユーザー基準の状態をまとめて解決する。
   *
   * follow 状態をユーザーごとに問い合わせると N+1 になるため、
   * context 作成時に一括取得して mapper へ渡す。
   */
  const userListItemOptionsContext = await createUserListItemOptionsContext({
    users: sliced,
    currentUserId,
  });

  const items = sliced.map((user) =>
    toUserListItem({
      user,
      options: createUserListItemOptions(user, userListItemOptionsContext),
    }),
  );

  const lastUser = sliced.at(-1);

  return {
    items,
    nextCursor: lastUser
      ? {
          username: lastUser.username,
        }
      : null,
    hasMore,
  };
}
