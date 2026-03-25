import LeftSidebar from "@/features/app/components/LeftSidebar"
import RightSidebar from "@/features/app/components/RightSidebar"
import AppTabs from "@/features/app/components/AppTabs";
import ComposerCard from "@/features/app/components/ComposerCard";
import FeedList from "@/features/app/components/FeedList";
import MobileTopBar from "@/features/app/components/MobileTopBar";
import MobileBottomNav from "@/features/app/components/MobileBottomNav";
import { CurrentUser } from "@/lib/auth/current-user";
import { TimelineItem } from "@/features/post/types/timeline";


type Props = {
  currentUser: CurrentUser | null;
  posts: TimelineItem[];
};

export default function AppLayout({ currentUser, posts }: Props) {


  return (
    <div className="min-h-dvh bg-black text-white">
      <MobileTopBar />

      <div className="flex">
        <aside className="hidden md:flex flex-auto md:basis-[88px] xl:basis-[275px] justify-end">
          <div className="sticky top-0 h-dvh overflow-y-auto shrink-0 border-r border-white/10
            md:w-[88px] 
            xl:w-[275px]">
            <LeftSidebar currentUser={currentUser} />
          </div>
        </aside>

        <div className="min-w-0 flex-auto md:basis-[600px] xl:basis-[950px] flex justify-start">
          <main className="min-w-0 flex-1 border-r border-white/10 
            md:max-w-[600px]">
            <AppTabs />
            <ComposerCard />
            <FeedList posts={posts} />
          </main>

          <aside className="hidden shrink-0
            xl:block xl:w-[350px]">
            <RightSidebar />
          </aside>
          
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}