import UserPostsPageView from "@/app/(protected)/users/[username]/_components/UserPostsPageView";
import { getUserPostsPageByUsername } from "@/features/post/server/get-user-posts-page";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserPostsPage({
  params
}: Props) {
  const { username } = params;

  const [feedPage] = await Promise.all([
    getUserPostsPageByUsername({username, limit: 20}),
  ]);

  return (
    <UserPostsPageView
      username={username}
      feedPage={feedPage}
    />
  );
}