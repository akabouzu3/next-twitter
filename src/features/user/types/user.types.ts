import { UserRole } from "@prisma/client";

export type RecommendedUser = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  image: string | null;
  followerCount: number;
  isFollowing: boolean;
};

export type UserProfileItem = {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  bio: string | null;
  image: string | null;
  backgroundImage: string | null;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
};