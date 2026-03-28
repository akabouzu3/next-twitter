import { Metadata } from "next";
import App from "@/features/app/components/App";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTimeline } from "@/features/post/queries/get-timeline";
import { getRecommendedUsers } from "@/features/user/queries/getRecommendedUsers";

export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await getCurrentUser();
  const timeline = await getTimeline();
  const recommendUsers = await getRecommendedUsers(10);

  return (
    <>
    <App currentUser={currentUser} posts={timeline} recommendUsers={recommendUsers}/>
    </>
  )
}
