import { UserProfileWithFollowStatus } from "@/features/user/server/get-user";
import { UserProfileItem } from "@/features/user/types/user.types";

export function toUserProfileItem(
  user: UserProfileWithFollowStatus
): UserProfileItem {
  return {
    id: user.id,
    role: user.role,
    name: user.name ?? user.username,
    username: user.username,
    bio: user.bio,
    image: user.image,
    backgroundImage: user.backgroundImage,
    createdAt: user.createdAt,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    postCount: user._count.posts,
    isFollowing: user.isFollowing,
  };
}