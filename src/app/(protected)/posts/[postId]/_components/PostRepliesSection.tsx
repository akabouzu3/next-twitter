import PostRepliesPageView from "@/app/(protected)/posts/[postId]/_components/PostRepliesPageView";
import { getPostRepliesFeedPage } from "@/features/post/server/get-post-replies-feed-page";

type Props = {
  postId: string;
};

export default async function PostRepliesSection({ postId }: Props) {
  const repliesPage = await getPostRepliesFeedPage({
    postId,
    limit: 10,
  });

  return <PostRepliesPageView postId={postId} repliesPage={repliesPage} />;
}
