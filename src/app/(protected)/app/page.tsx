import { Metadata } from "next";
import App from "@/features/app/components/App";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTimeline } from "@/features/post/queries/get-timeline";

export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await getCurrentUser();
  const timeline = await getTimeline();
  console.log(timeline);

  return (
    <>
    <App currentUser={currentUser} posts={timeline}/>
    </>
  )
}
