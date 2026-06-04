import UserRepliesPageView from "@/app/(protected)/users/[username]/(profile)/with_replies/_components/UserRepliesPageView";
import { getUserRepliesPostFeedPageByUserId } from "@/features/post/server/get-user-replies-post-feed-page";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserRepliesPage({ params }: Props) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const feedPage = await getUserRepliesPostFeedPageByUserId({
    userId: user.id,
    limit: 10,
  });

  return <UserRepliesPageView user={user} feedPage={feedPage} />;
}
