

import UserPageHeader from "@/app/(protected)/users/[username]/_components/UserPageHeader";
import UserProfileComponent from "@/app/(protected)/users/[username]/_components/UserProfile";
import UserProfileTabs from "@/app/(protected)/users/[username]/_components/UserProfileTabs";
import { getUserByUsername } from "@/features/user/server/get-user";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/guards";

type Props = {
  children: React.ReactNode;
  params: {
    username: string;
  };
};

export default async function UserProfileLayout({
  children,
  params,
}: Props) {

  const { username } = params;

  const [currentUser, user] = await Promise.all([
    requireCurrentUser(),
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
      {children}
    </>
  )
}
