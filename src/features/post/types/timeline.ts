// src/features/post/types/timeline.ts
export type TimelineItem = {
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