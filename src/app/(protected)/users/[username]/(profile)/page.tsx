import UserPostsPageView from "@/app/(protected)/users/[username]/(profile)/_components/UserPostsPageView";
import { getUserPostFeedPageByUserId } from "@/features/post/server/get-user-post-feed-page";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserPostsPage({
  params
}: Props) {
  const { username } = await params;

  const [
    // currentUser,
    user,
  ] = await Promise.all([
    // requireCurrentUser(),
    getUserByUsername(username),
  ]);

  if(!user){
    notFound();
  }

  const [feedPage] = await Promise.all([
    getUserPostFeedPageByUserId({
      userId: user.id,
      limit: 10
    }),
  ]);

  return (
    <UserPostsPageView
      user={user}
      feedPage={feedPage}
    />
  );
}
