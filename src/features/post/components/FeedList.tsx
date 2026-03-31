import Feed from "@/features/post/components/FeedItem";
import { FeedItem } from "@/features/post/types/post.types";


type Props = {
  posts: FeedItem[];
};

export default function FeedList({ posts }: Props) {
  return (
    <section>
      {posts.map((post) => (
        <Feed key={post.id} post={post} />
      ))}
    </section>
  );
}