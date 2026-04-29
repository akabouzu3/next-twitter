import UserPostsPageView from "@/app/(protected)/users/[username]/_components/UserPostsPageView";
import { getUserPostsPageByUsername } from "@/features/post/server/get-user-posts-page";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserPostsPage({
  params
}: Props) {
  const { username } = params;

  const [user,feedPage] = await Promise.all([
    getUserByUsername(username),
    getUserPostsPageByUsername({username, limit: 20}),
  ]);

  // ❗ userがない = URLが不正
  if (!user) {
    notFound();
  }

  return (
    <UserPostsPageView
      user={user}
      feedPage={feedPage}
    />
  );
}