import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import type { ToUserListItemOptions } from "@/features/user/server/mappers/mappers";
import type { UserListUserPayload } from "@/features/user/server/selects/selects";

type Input = {
  users: UserListUserPayload[];
  currentUserId: string | null;

  /**
   * 呼び出し元でフォロー中ユーザーIDを解決済みの場合に渡す。
   * 例: フォロー中ユーザーだけを表示する一覧では、追加クエリを避けられる。
   */
  followingIdSet?: ReadonlySet<string>;
};

export type UserListItemOptionsContext = {
  currentUserId: string | null;
  followingIdSet: ReadonlySet<string>;
};

/**
 * 表示対象ユーザーのうち、現在ユーザーがフォローしているユーザーIDを Set で返す。
 *
 * ユーザー行ごとに follow を確認すると N+1 クエリになるため、
 * 1ページ分の userIds だけをまとめて `follow.findMany` で解決する。
 *
 * 自分自身の行はフォローボタンを表示しないため、呼び出し元で除外しておく。
 * 未ログイン時や表示対象が空の場合は、すべて未フォロー扱いにできる空 Set を返す。
 */
async function getFollowingIdSet({
  currentUserId,
  userIds,
}: {
  currentUserId: string | null;
  userIds: string[];
}): Promise<Set<string>> {
  if (!currentUserId || userIds.length === 0) {
    return new Set();
  }

  const follows = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
      followingId: {
        in: userIds,
      },
    },
    select: {
      followingId: true,
    },
  });

  return new Set(follows.map((follow) => follow.followingId));
}

/**
 * UserListItem 変換時に必要な「現在ユーザー基準の状態」をまとめて解決し、
 * ユーザーごとの ToUserListItemOptions を作るための context を返す。
 *
 * ■ 解決する状態
 * - 現在ユーザー自身の行か
 * - 現在ユーザーが対象ユーザーをフォローしているか
 *
 * ■ 設計ポイント
 * - follow 状態はユーザー一覧全体で一括取得し、mapper 実行時の追加DBアクセスを防ぐ
 * - `followingIdSet` が渡されている場合は、呼び出し元の既知情報を再利用する
 * - mapper は DB や認証情報に触れず、ここで解決済みの boolean だけを受け取る
 * - 未ログイン時は安全側として `isMe=false` / `isFollowing=false` になる
 */
export async function createUserListItemOptionsContext({
  users,
  currentUserId,
  followingIdSet,
}: Input): Promise<UserListItemOptionsContext> {
  const userIds = users
    .map((user) => user.id)
    .filter((userId) => userId !== currentUserId);

  const resolvedFollowingIdSet =
    followingIdSet ??
    await getFollowingIdSet({
      currentUserId,
      userIds,
    });

  return {
    currentUserId,
    followingIdSet: resolvedFollowingIdSet,
  };
}

/**
 * ユーザー1件と事前に解決済みの context から ToUserListItemOptions を作る。
 *
 * mapper 側では現在ユーザーIDや follow 一覧を直接見ず、
 * この関数で作った表示用 options だけを参照する。
 */
export function createUserListItemOptions(
  user: UserListUserPayload,
  context: UserListItemOptionsContext,
): ToUserListItemOptions {
  const isMe = context.currentUserId === user.id;

  return {
    isMe,
    isFollowing: !isMe && context.followingIdSet.has(user.id),
  };
}
