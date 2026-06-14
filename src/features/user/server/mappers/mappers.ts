import type { UserProfileWithFollowStatus } from "@/features/user/server/get-user";
import type { UserListItem, UserProfileItem } from "@/features/user/types/user.types";
import type { UserListUserPayload } from "@/features/user/server/selects/selects";

export type ToUserListItemOptions = {
  isFollowing?: boolean;
  isMe?: boolean;
};

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

export function toUserListItem({
  user,
  options = {},
}: {
  user: UserListUserPayload;
  options?: ToUserListItemOptions;
}): UserListItem {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    image: user.image,
    followerCount: user._count.followers,
    isFollowing: options.isFollowing ?? false,
    isMe: options.isMe ?? false,
  };
}
