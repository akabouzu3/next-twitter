// =====================
// Cursor
// =====================
export type Cursor = {
  createdAt: string;
  id: string;
};

// =====================
// Pagination
// =====================
export type CursorPage<T> = {
  items: T[];
  nextCursor: Cursor | null;
  hasMore: boolean;
};

// =====================
// Feed
// =====================
/**
 * フィード表示用に整形した投稿データ。
 *
 * DBのPostそのものではなく、UIが必要とする投稿者情報・画像・集計値だけに絞る。
 */
export type FeedItem = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  images: {
    id: string;
    url: string;
  }[];
  replyTo: {
    id: string;
    user: {
      id: string;
      name: string;
      username: string;
    };
  } | null;

  // 投稿の閲覧数。
  viewCount: number;

  // 投稿についたいいね総数。
  likeCount: number;

  // 投稿についた直下返信の総数。
  replyCount: number;

  // 現在ログイン中のユーザーがこの投稿をいいね済みかどうか。
  likedByMe: boolean;

  // 現在ログイン中のユーザーがこの投稿を削除できるかどうか。
  canDelete: boolean;

  // 現在ログイン中のユーザー自身の投稿かどうか。
  isOwnPost: boolean;

  // 現在ログイン中のユーザーが投稿者をフォローしているかどうか。
  isFollowingAuthor: boolean;
};

// =====================
// Usecase
// =====================
export type FeedPage = CursorPage<FeedItem>;
