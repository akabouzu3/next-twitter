import AppFeedPageView from "@/app/(protected)/app/_components/AppFeedPageView";
import { getRecommendedPostFeedPage } from "@/features/post/server/get-recommended-post-feed-page";
import { getTimelinePage } from "@/features/post/server/get-timeline-page";

type AppFeed = "recommended" | "following";

type Props = {
  activeFeed: AppFeed;
};

export default async function AppFeedSection({ activeFeed }: Props) {
  const feedPage =
    activeFeed === "following"
      ? await getTimelinePage({
          limit: 20,
        })
      : await getRecommendedPostFeedPage({
          limit: 20,
        });

  return <AppFeedPageView activeFeed={activeFeed} feedPage={feedPage} />;
}
