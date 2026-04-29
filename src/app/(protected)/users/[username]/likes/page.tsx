import UserLikesPageView from "@/app/(protected)/users/[username]/likes/_components/UserLikesPageView";
import { getUserLikedPostsPage } from "@/features/post/server/get-user-liked-posts-page";
import { getUserByUsername } from "@/features/user/server/get-user";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserLikesPage({
  params
}: Props) {
  const { username } = params;

  const user = await getUserByUsername(username);

  const [feedPage] = await Promise.all([
    getUserLikedPostsPage({
      where: { userId: user?.id },
      limit: 20
    }),
  ]);

  return (
    <UserLikesPageView
      username={username}
      feedPage={feedPage}
    />
  );
}