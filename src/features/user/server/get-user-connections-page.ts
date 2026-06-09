import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
import {
  userConnectionFollowSelect,
  type UserConnectionFollowPayload,
  type UserListUserPayload,
} from "@/features/user/server/selects/selects";
import { toUserListItem } from "@/features/user/server/mappers/mappers";
import {
  createUserListItemOptions,
  createUserListItemOptionsContext,
} from "@/features/user/server/create-user-list-item-options";
import type {
  UserConnectionCursor,
  UserConnectionPage,
} from "@/features/user/types/user.types";

const PAGE_SIZE = 20;

export type UserConnectionKind = "followers" | "following";

type Input = {
  username: string;
  kind: UserConnectionKind;
  limit?: number;
  cursor?: UserConnectionCursor | null;
};

export async function getUserConnectionsPage({
  username,
  kind,
  limit = PAGE_SIZE,
  cursor,
}: Input): Promise<UserConnectionPage | null> {
  /**
   * 先に必要な前提情報を並列で取得する。
   *
   * - currentUserId: 一覧内ユーザーをログイン中ユーザーがフォローしているか判定するため
   * - targetUser: followers / following を取得する基準ユーザー
   */
  const [currentUserId, targetUser] = await Promise.all([
    getCurrentSessionUserId(),
    prisma.user.findUnique({
      where: { username },
      select: { id: true },
    }),
  ]);

  if (!targetUser) return null;

  /**
   * Follow 一覧を cursor pagination で取得する。
   *
   * orderBy は createdAt DESC + id DESC。
   * createdAt が同じ Follow があっても id で順序を一意にできるため、
   * ページング中の重複や順序ブレを避けやすい。
   */
  const follows: UserConnectionFollowPayload[] = await prisma.follow.findMany({
    /**
     * followers:
     * - targetUser をフォローしている人を取得する（following(フォローする対象) = targetUser.id）
     * - Follow.followingId が targetUser.id のレコード
     *
     * following:
     * - targetUser がフォローしている人を取得する（follower(フォローする人) = targetUser.id）
     * - Follow.followerId が targetUser.id のレコード
     */
    where:
      kind === "followers"
        ? { followingId: targetUser.id }
        : { followerId: targetUser.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor
      ? {
          /**
           * @@unique([createdAt, id]) を使った複合 cursor。
           * orderBy と同じキーを cursor にすることで、
           * 同時刻に作られた Follow があっても次ページの開始位置が安定する。
           */
          cursor: {
            createdAt_id: {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            },
          },
          skip: 1,
        }
      : {}),
    select: userConnectionFollowSelect,
  });

  /**
   * limit + 1 件取得しているため、1件多ければ次ページあり。
   * UI に返す items は limit 件までに切り詰める。
   */
  const hasMore = follows.length > limit;
  const sliced = hasMore ? follows.slice(0, limit) : follows;

  /**
   * Follow レコードから、画面に表示するユーザー側だけを取り出す。
   *
   * - followers 一覧: follow.follower が表示対象
   * - following 一覧: follow.following が表示対象
   */
  const users: UserListUserPayload[] = sliced.map((follow) =>
    kind === "followers" ? follow.follower : follow.following,
  );

  /**
   * mapper に渡す現在ユーザー基準の状態を、一覧全体でまとめて解決する。
   */
  const userListItemOptionsContext = await createUserListItemOptionsContext({
    users,
    currentUserId,
  });

  /**
   * DB 取得用の shape を UI 用の UserListItem に変換する。
   * isFollowing / isMe は現在ログイン中のユーザー視点で決まる表示状態。
   */
  const items = users.map((user) =>
    toUserListItem({
      user,
      options: createUserListItemOptions(user, userListItemOptionsContext),
    }),
  );

  const lastFollow = sliced.at(-1);

  return {
    items,

    /**
     * 次ページ取得時は、今回返した最後の Follow を基準にする。
     * hasMore が false の場合でも最後の cursor 自体は返せるが、
     * 呼び出し側は hasMore を見て追加取得を止める。
     */
    nextCursor: lastFollow
      ? {
          createdAt: lastFollow.createdAt.toISOString(),
          id: lastFollow.id,
        }
      : null,
    hasMore,
  };
}
