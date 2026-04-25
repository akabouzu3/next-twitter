"use client"
import AppPageHeader from "@/app/(protected)/app/_components/AppHeader";
import PostComposer from "@/features/post/components/PostComposer";
import FeedList from "@/features/post/components/FeedList";
import { CurrentUser } from "@/lib/auth/current-user";
import { FeedPage } from "@/features/post/types/post.types";
import { fetchTimelinePage } from "@/features/post/client/fetch-timeline-page";

type Props = {
  currentUser: CurrentUser | null;
  timelinePage: FeedPage;
};

export default function AppPageView({ currentUser, timelinePage}: Props) {


  return (
    <>
      <AppPageHeader currentUser={currentUser} />
      <section className="hidden md:block border-b border-white/10 px-4 py-4">
        <PostComposer currentUser={currentUser} />
      </section>
      <FeedList initialPage={timelinePage} fetchPage={fetchTimelinePage}/>
    </>
  );
}