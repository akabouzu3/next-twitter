import { Metadata } from "next";
import AppPageView from "@/app/(protected)/app/_components/AppPageView";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTimeline } from "@/features/post/server/get-timeline";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { MobilePostComposerTrigger } from "@/features/post/components/MobilePostComposerTrigger";

export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await getCurrentUser();
  const timeline = await getTimeline();
  

  return (
    <>
      <AppPageView currentUser={currentUser} posts={timeline}/>

      <MobilePostComposerTrigger currentUser={currentUser} />
      <MobileBottomNav />
    </>
  )
}
