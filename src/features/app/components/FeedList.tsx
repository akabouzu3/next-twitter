import FeedItem from "@/features/app/components/FeedItem";

type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    verified?: boolean;
  };
  content: string;
  createdAt: string;
  stats: {
    replies: number;
    reposts: number;
    likes: number;
    views: string;
  };
  imageUrl?: string;
};

type Props = {
  posts: Post[];
};

export default function FeedList({ posts }: Props) {
  return (
    <section>
      {posts.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
    </section>
  );
}