import type { UserProfileWithFollowStatus } from "@/features/user/server/get-user";
import type { UserConnectionItem, UserProfileItem } from "@/features/user/types/user.types";
import type { UserConnectionUserPayload } from "@/features/user/server/selects/selects";

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

export function toUserConnectionItem({
  user,
  currentUserId,
  followingIdSet,
}: {
  user: UserConnectionUserPayload;
  currentUserId: string | null;
  followingIdSet: Set<string>;
}): UserConnectionItem {
  const isMe = currentUserId === user.id;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    image: user.image,
    followerCount: user._count.followers,
    isFollowing: isMe ? false : followingIdSet.has(user.id),
    isMe,
  };
}
