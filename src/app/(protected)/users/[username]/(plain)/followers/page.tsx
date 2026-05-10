
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

export default async function FollowersPage({ params }: Props) {
  const { username } = await params;

  const [user, initialPage] = await Promise.all([
    getUserByUsername(username),
    getUserConnectionsPage({
      username,
      kind: "followers",
      limit: 20,
    }),
  ]);

  if (!user || !initialPage) {
    notFound();
  }

  return (
    <>
      <UserConnectionsHeader user={user} activeTab="followers" />
      <UserConnectionsList
        username={user.username}
        kind="followers"
        initialPage={initialPage}
        emptyMessage="フォロワーはいません"
        endMessage="これ以上フォロワーはいません"
      />
    </>
  );
}
