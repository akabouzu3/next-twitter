
import { Suspense } from "react";
import UserPageHeader from "@/app/(protected)/users/[username]/(profile)/_components/UserPageHeader";
import UserProfileComponent from "@/app/(protected)/users/[username]/(profile)/_components/UserProfile";
import UserProfileTabs from "@/app/(protected)/users/[username]/(profile)/_components/UserProfileTabs";
import FeedListLoading from "@/features/post/components/FeedListLoading";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/page-guards";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    username: string;
  }>;
};

export default async function UserProfileLayout({
  children,
  params,
}: Props) {

  const { username } = await params;

  const [
    currentUser,
    user,
  ] = await Promise.all([
    requireAuth(),
    getUserByUsername(username),
  ]);

  // ❗ userがない = URLが不正
  if (!user) {
    notFound();
  }

  return (
    <>
      <UserPageHeader user={user}/>
      <UserProfileComponent currentUser={currentUser} user={user} />
      <UserProfileTabs user={user}/>
      <Suspense fallback={<FeedListLoading />}>{children}</Suspense>
    </>
  )
}
