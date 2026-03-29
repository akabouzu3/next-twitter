import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUserId } from "@/lib/auth/session";
import { RecommendedUser } from "@/features/user/types/user";


const RECOMMEND_LIMIT = 10;

export async function getRecommendedUsers(
  limit: number = RECOMMEND_LIMIT
): Promise<RecommendedUser[]> {

  const currentUserId = await getCurrentSessionUserId();

  if (!currentUserId) {
    return [];
  }

  // // 自分がフォローしているユーザーID一覧を取得
  // const follows = await prisma.follow.findMany({
  //   where: {
  //     followerId: currentUserId,
  //   },
  //   select: {
  //     followingId: true,
  //   },
  // });

  // const followingIds = follows.map((follow) => follow.followingId);

  // // 自分 + すでにフォローしているユーザーは除外
  // const excludeUserIds = [currentUserId, ...followingIds];

  // 自分を除外する
  const excludeUserIds = [currentUserId];

  const users = await prisma.user.findMany({
    where: {
      id: {
        notIn: excludeUserIds,
      },
      // 必要なら有効ユーザーだけ
      // isActive: true,
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      _count: {
        select: {
          followers: true,
        },
      },
      followers: {
        where: {
          followerId: currentUserId, // フォロー状態を取得する（currentUserがuserをフォローしてる場合に取得される）
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: [
      {
        followers: {
          _count: "desc",
        },
      },
      {
        username: "asc",
      },
    ],
    take: limit,
  });

  return users.map<RecommendedUser>(user => {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      followerCount: user._count.followers,
      isFollowing: user.followers.length > 0,
    }
  });
}