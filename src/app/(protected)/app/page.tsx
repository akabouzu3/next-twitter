import { Metadata } from "next";
import { Suspense } from "react";
import AppFeedSection from "@/app/(protected)/app/_components/AppFeedSection";
import AppPageHeader from "@/app/(protected)/app/_components/AppHeader";
import PostComposer from "@/features/post/components/PostComposer";
import { requireAuth } from "@/lib/auth/page-guards";
import FeedListLoading from "@/features/post/components/FeedListLoading";

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
  

  return (
    <>
      <AppPageHeader activeFeed={activeFeed} currentUser={currentUser} />
      <section className="hidden border-b border-white/10 px-4 py-4 md:block">
        <PostComposer currentUser={currentUser} />
      </section>
      <Suspense key={activeFeed} fallback={<FeedListLoading />}>
        <AppFeedSection activeFeed={activeFeed} />
      </Suspense>
    </>
  )
}
