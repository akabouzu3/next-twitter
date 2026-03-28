import LeftSidebar from "@/features/app/components/LeftSidebar"
import RightSidebar from "@/features/app/components/RightSidebar"
import AppTabs from "@/features/app/components/AppTabs";
import ComposerCard from "@/features/app/components/ComposerCard";
import FeedList from "@/features/post/components/FeedList";
import { CurrentUser } from "@/lib/auth/current-user";
import { FeedItem } from "@/features/post/types/feed";
import { RecommendedUser } from "@/features/user/types/user";


type Props = {
  currentUser: CurrentUser | null;
  posts: FeedItem[];
  recommendUsers: RecommendedUser[];
};

export default function App({ currentUser, posts, recommendUsers }: Props) {


  return (
    <div className="min-w-0 flex-auto flex justify-start">
      <main className="min-w-0 flex-1 basis-[600px] border-r border-white/10 max-w-[600px]">
        <AppTabs />
        <ComposerCard />
        <FeedList posts={posts} />
      </main>

      <aside className="hidden shrink-0
        xl:block xl:w-[350px]">
        <RightSidebar recommendUsers={recommendUsers}/>
      </aside>
      
    </div>
  );
}