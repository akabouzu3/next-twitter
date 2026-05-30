import { Metadata } from "next";
import AppPageView from "@/app/(protected)/app/_components/AppPageView";
import { requireAuth } from "@/lib/auth/page-guards";
import { getTimelinePage } from "@/features/post/server/get-timeline-page";
import { getRecommendedPostFeedPage } from "@/features/post/server/get-recommended-post-feed-page";

export const metadata: Metadata = {
  title: "ホーム"
};

type AppFeed = "recommended" | "following";

type Props = {
  searchParams: Promise<{
    feed?: string;
  }>;
};

function parseAppFeed(feed?: string): AppFeed {
  return feed === "following" ? "following" : "recommended";
}

export default async function AppPage({ searchParams }: Props) {

  const currentUser = await requireAuth();
  const { feed } = await searchParams;
  const activeFeed = parseAppFeed(feed);
  const feedPage =
    activeFeed === "following"
      ? await getTimelinePage({
          limit: 20,
        })
      : await getRecommendedPostFeedPage({
          limit: 20,
        });
  

  return (
    <>
      <AppPageView
        activeFeed={activeFeed}
        currentUser={currentUser}
        feedPage={feedPage}
      />
    </>
  )
}
