import UserConnectionsHeader from "@/app/(protected)/users/[username]/(plain)/_components/UserConnectionsHeader";
import UserConnectionsList from "@/app/(protected)/users/[username]/(plain)/_components/UserConnectionsList";
import { getUserByUsername } from "@/features/user/server/get-user";
import { getUserConnectionsPage } from "@/features/user/server/get-user-connections-page";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function FollowingPage({ params }: Props) {
  const { username } = await params;

  const [user, initialPage] = await Promise.all([
    getUserByUsername(username),
    getUserConnectionsPage({
      username,
      kind: "following",
      limit: 20,
    }),
  ]);

  if (!user || !initialPage) {
    notFound();
  }

  return (
    <>
      <UserConnectionsHeader user={user} activeTab="following" />
      <UserConnectionsList
        username={user.username}
        kind="following"
        initialPage={initialPage}
        emptyMessage="フォロー中のユーザーはいません"
        endMessage="これ以上フォロー中のユーザーはいません"
      />
    </>
  );
}
