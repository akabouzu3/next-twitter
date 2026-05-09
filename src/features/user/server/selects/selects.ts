import { Prisma } from "@prisma/client";

/**
 * フォロー / フォロワー一覧で表示するユーザー情報。
 *
 * follower / following の両方で同じ表示 shape を使うため、
 * User select として切り出して Follow select から再利用する。
 */
export const userConnectionUserSelect = {
  id: true,
  name: true,
  username: true,
  bio: true,
  image: true,
  _count: {
    select: {
      followers: true,
    },
  },
} satisfies Prisma.UserSelect;

/**
 * UserConnectionPage に変換するための Follow select。
 *
 * followers 一覧では follower を、following 一覧では following を使う。
 * どちらの一覧でも同じ select にしておくと、mapper 側の型が安定する。
 */
export const userConnectionFollowSelect = {
  id: true,
  createdAt: true,
  follower: {
    select: userConnectionUserSelect,
  },
  following: {
    select: userConnectionUserSelect,
  },
} satisfies Prisma.FollowSelect;

export type UserConnectionUserPayload = Prisma.UserGetPayload<{
  select: typeof userConnectionUserSelect;
}>;

export type UserConnectionFollowPayload = Prisma.FollowGetPayload<{
  select: typeof userConnectionFollowSelect;
}>;
