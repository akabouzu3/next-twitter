import "server-only";

type Role = "USER" | "ADMIN";

type UserLike = {
  id: string;
  role: Role;
};

type PostLike = {
  userId: string;
};

export function isAdmin(user: UserLike): boolean {
  return user.role === "ADMIN";
}

export function isPostOwner(user: UserLike, post: PostLike): boolean {
  return user.id === post.userId;
}

export function canEditPost(user: UserLike, post: PostLike): boolean {
  return isAdmin(user) || isPostOwner(user, post);
}

export function canDeletePost(user: UserLike, post: PostLike): boolean {
  return isAdmin(user) || isPostOwner(user, post);
}