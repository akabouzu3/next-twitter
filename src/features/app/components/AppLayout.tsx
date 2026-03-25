import LeftSidebar from "@/features/app/components/LeftSidebar"
import RightSidebar from "@/features/app/components/RightSidebar"
import AppTabs from "@/features/app/components/AppTabs";
import ComposerCard from "@/features/app/components/ComposerCard";
import FeedList from "@/features/post/components/FeedList";
import { CurrentUser } from "@/lib/auth/current-user";
import { FeedItem } from "@/features/post/types/feed";


type Props = {
  currentUser: CurrentUser | null;
  posts: FeedItem[];
};

export default function AppLayout({ currentUser, posts }: Props) {


  return (
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
  );
}