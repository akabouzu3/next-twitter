import { Metadata } from "next";
import AppPageView from "@/app/(protected)/app/_components/AppPageView";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTimelinePage } from "@/features/post/server/get-timeline-page";


export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await getCurrentUser();
  const timelinePage = await getTimelinePage({
    limit: 10,
  });
  

  return (
    <>
      <AppPageView currentUser={currentUser} timelinePage={timelinePage}/>
    </>
  )
}
