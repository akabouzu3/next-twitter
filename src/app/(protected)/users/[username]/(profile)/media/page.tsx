import UserMediaPageView from "@/app/(protected)/users/[username]/(profile)/media/_components/UserMediaPageView";
import { getUserMediaPostFeedPageByUserId } from "@/features/post/server/get-user-media-post-feed-page";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserMediaPage({
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
    getUserMediaPostFeedPageByUserId({
      userId: user.id,
      limit: 10,
    }),
  ]);

  return (
    <UserMediaPageView
      user={user}
      feedPage={feedPage}
    />
  );
}
