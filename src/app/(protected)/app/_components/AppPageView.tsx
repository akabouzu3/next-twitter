
import AppHeader from "@/app/(protected)/app/_components/AppHeader";
import PostComposer from "@/features/post/components/PostComposer";
import FeedList from "@/features/post/components/FeedList";
import { CurrentUser } from "@/lib/auth/current-user";
import { TimelinePage } from "@/features/post/types/post.types";

type Props = {
  currentUser: CurrentUser | null;
  timelinePage: TimelinePage;
};

export default function AppPageView({ currentUser, timelinePage}: Props) {


  return (
    <>
      <AppHeader currentUser={currentUser} />
      <section className="hidden md:block border-b border-white/10 px-4 py-4">
        <PostComposer currentUser={currentUser} />
      </section>
      <FeedList timelinePage={timelinePage}/>
    </>
  );
}