import { Metadata } from "next";
import AppPageView from "@/app/(protected)/app/_components/AppPageView";
import { requireAuth } from "@/lib/auth/page-guards";
import { getTimelinePage } from "@/features/post/server/get-timeline-page";


export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await requireAuth();
  const timelinePage = await getTimelinePage({
    limit: 20,
  });
  

  return (
    <>
      <AppPageView currentUser={currentUser} timelinePage={timelinePage}/>
    </>
  )
}
