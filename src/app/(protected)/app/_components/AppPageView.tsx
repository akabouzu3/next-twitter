"use client"
import AppPageHeader from "@/app/(protected)/app/_components/AppHeader";
import PostComposer from "@/features/post/components/PostComposer";
import FeedList from "@/features/post/components/FeedList";
import { CurrentUser } from "@/lib/auth/current-user";
import { FeedPage } from "@/features/post/types/post.types";
import { fetchTimelinePage } from "@/features/post/client/fetch-timeline-page";
import { fetchRecommendedPostFeedPage } from "@/features/post/client/fetch-recommended-post-feed-page";

type AppFeed = "recommended" | "following";

type Props = {
  activeFeed: AppFeed;
  currentUser: CurrentUser | null;
  feedPage: FeedPage;
};

export default function AppPageView({ activeFeed, currentUser, feedPage}: Props) {

  const fetchPage =
    activeFeed === "following"
      ? fetchTimelinePage
      : fetchRecommendedPostFeedPage;

  return (
    <>
      <AppPageHeader activeFeed={activeFeed} currentUser={currentUser} />
      <section className="hidden md:block border-b border-white/10 px-4 py-4">
        <PostComposer currentUser={currentUser} />
      </section>
      <FeedList initialPage={feedPage} fetchPage={fetchPage}/>
    </>
  );
}
