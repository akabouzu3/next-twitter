import { Prisma } from "@prisma/client";

/**
 * ユーザー一覧 UI で表示する共通のユーザー情報。
 */
export const userListUserSelect = {
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
    select: userListUserSelect,
  },
  following: {
    select: userListUserSelect,
  },
} satisfies Prisma.FollowSelect;

export type UserListUserPayload = Prisma.UserGetPayload<{
  select: typeof userListUserSelect;
}>;

export type UserConnectionFollowPayload = Prisma.FollowGetPayload<{
  select: typeof userConnectionFollowSelect;
}>;
