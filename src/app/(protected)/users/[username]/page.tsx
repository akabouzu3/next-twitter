import UserPostsPageView from "@/app/(protected)/users/[username]/_components/UserPostsPageView";
import { getUserPostsPage } from "@/features/post/server/get-user-posts-page";
import { getUserByUsername } from "@/features/user/server/get-user";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserPostsPage({
  params
}: Props) {
  const { username } = params;

  const user = await getUserByUsername(username);

  const [feedPage] = await Promise.all([
    getUserPostsPage({
      where: { userId: user?.id },
      limit: 20
    }),
  ]);

  return (
    <UserPostsPageView
      username={username}
      feedPage={feedPage}
    />
  );
}