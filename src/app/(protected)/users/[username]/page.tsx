import UserPageView from "@/app/(protected)/users/[username]/_components/UserPageView";
import { getUserByUsername } from "@/features/user/server/get-user";
import { getUserPostsByUsername } from "@/features/post/server/get-user-posts";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/guards";


type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserPage(props: Props) {
  const { username } = await props.params;

  const [currentUser, user, posts] = await Promise.all([
    requireCurrentUser(),
    getUserByUsername(username),
    getUserPostsByUsername({username, limit: 30}),
  ]);

  // ❗ userがない = URLが不正
  if (!user) {
    notFound();
  }

  return (
    <UserPageView
      currentUser={currentUser}
      user={user}
      posts={posts}
    />
  );
}