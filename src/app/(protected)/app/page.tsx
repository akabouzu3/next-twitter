import { Metadata } from "next";
import AppPageView from "@/app/(protected)/app/_components/App";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTimeline } from "@/features/post/server/get-timeline";
import { getRecommendedUsers } from "@/features/user/server/get-recommended-users";

export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await getCurrentUser();
  const timeline = await getTimeline();
  const recommendUsers = await getRecommendedUsers(10);

  return (
    <>
    <AppPageView currentUser={currentUser} posts={timeline} recommendUsers={recommendUsers}/>
    </>
  )
}
