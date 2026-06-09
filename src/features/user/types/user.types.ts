import { UserRole } from "@prisma/client";

/**
 * ユーザー一覧 UI の1行に表示する共通情報。
 *
 * おすすめユーザー、アカウント検索結果、フォロー / フォロワー一覧で
 * 同じ表示要件を使うため、一覧用の共通 shape として扱う。
 * `isMe` は自分自身の行でフォローボタンを隠すために使う。
 */
export type UserListItem = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  image: string | null;
  followerCount: number;
  isFollowing: boolean;
  isMe: boolean;
};

/**
 * 右サイドバーなどのおすすめユーザー表示で使うユーザー情報。
 */
export type RecommendedUser = UserListItem;

/**
 * プロフィールページ全体で使うユーザー情報。
 *
 * ヘッダー、プロフィール本文、タブ、編集フォームが参照するため、
 * 公開プロフィールに必要な集計値と画像情報をまとめて持つ。
 */
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

/**
 * フォロー / フォロワー一覧のカーソルページング位置。
 *
 * 一覧は `createdAt DESC, id DESC` の安定順で読むため、
 * 同じ時刻の follow があっても `id` で次ページの境界を固定する。
 */
export type UserConnectionCursor = {
  createdAt: string;
  id: string;
};

/**
 * フォロー / フォロワー一覧の1行に表示するユーザー情報。
 */
export type UserConnectionItem = UserListItem;

/**
 * アカウント検索結果の1行に表示するユーザー情報。
 *
 * 共通の一覧表示 shape を別名で扱い、検索用途であることを呼び出し側に残す。
 */
export type UserSearchItem = UserListItem;

/**
 * アカウント検索結果のカーソルページング位置。
 *
 * `username` は unique なため、Prisma cursor としてそのまま使える。
 */
export type UserSearchCursor = {
  username: string;
};

/**
 * アカウント検索 API と無限スクロール UI が共有するページ単位の戻り値。
 */
export type UserSearchPage = {
  items: UserSearchItem[];
  nextCursor: UserSearchCursor | null;
  hasMore: boolean;
};

/**
 * フォロー / フォロワー一覧 API と無限スクロール hook が共有するページ単位の戻り値。
 */
export type UserConnectionPage = {
  items: UserConnectionItem[];
  nextCursor: UserConnectionCursor | null;
  hasMore: boolean;
};
