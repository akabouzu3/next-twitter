
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