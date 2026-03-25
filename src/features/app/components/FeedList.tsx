import FeedItem from "@/features/app/components/FeedItem";
import { TimelineItem } from "@/features/post/types/timeline";


type Props = {
  posts: TimelineItem[];
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