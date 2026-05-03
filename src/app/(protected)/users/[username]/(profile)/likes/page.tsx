import UserLikesPageView from "@/app/(protected)/users/[username]/(profile)/likes/_components/UserLikesPageView";
import { getUserLikedPostFeedPageByUserId } from "@/features/post/server/get-user-liked-post-feed-page";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserLikesPage({
  params
}: Props) {
  const { username } = params;

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
    getUserLikedPostFeedPageByUserId({
      userId: user.id,
      limit: 10,
    }),
  ]);

  return (
    <UserLikesPageView
      user={user}
      feedPage={feedPage}
    />
  );
}