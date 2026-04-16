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
export type PaginatedResult<T> = {
  items: T[];
  nextCursor: Cursor | null;
  hasMore: boolean;
};

// =====================
// Feed
// =====================
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
  likeCount: number;
};

// =====================
// Usecase
// =====================
export type TimelinePage = PaginatedResult<FeedItem>;