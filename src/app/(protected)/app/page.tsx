import { Metadata } from "next";
import AppLayout from "@/features/app/components/AppLayout";
import { mockPosts } from "@/features/app/data/mock-posts"
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
    <AppLayout currentUser={currentUser} posts={mockPosts}/>
    {/* <AppLayout currentUser={currentUser} posts={timeline}/> */}
    </>
  )
}
