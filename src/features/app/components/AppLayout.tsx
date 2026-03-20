import LeftSidebar from "@/features/app/components/LeftSidebar"
import RightSidebar from "@/features/app/components/RightSidebar"
import AppTabs from "@/features/app/components/AppTabs";
import ComposerCard from "@/features/app/components/ComposerCard";
import FeedList from "@/features/app/components/FeedList";
import MobileTopBar from "@/features/app/components/MobileTopBar";
import MobileBottomNav from "@/features/app/components/MobileBottomNav";

type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    verified?: boolean;
  };
  content: string;
  createdAt: string;
  stats: {
    replies: number;
    reposts: number;
    likes: number;
    views: string;
  };
  imageUrl?: string;
};

type Props = {
  posts: Post[];
};

export default function AppLayout({ posts }: Props) {

  // return (
  //   <div className="min-h-dvh bg-black text-white">
  //     <MobileTopBar />

  //     <div className="mx-auto flex w-full max-w-[1400px]">
  //       <aside className="hidden md:flex md:w-20 xl:w-[275px] shrink-0 border-r border-white/10">
  //         <LeftSidebar />
  //       </aside>

  //       <main className="min-w-0 flex-1 border-r border-white/10 md:max-w-[600px] xl:max-w-[620px]">
  //         <AppTabs />
  //         <ComposerCard />
  //         <FeedList posts={posts} />
  //       </main>

  //       <aside className="hidden xl:block xl:w-[380px] shrink-0">
  //         <RightSidebar />
  //       </aside>
  //     </div>

  //     <MobileBottomNav />
  //   </div>
  // );

  return (
    <div className="min-h-dvh bg-black text-white">
      <MobileTopBar />

      <div className="flex">
        <aside className="hidden flex-1 justify-end 
          md:flex md:basis-[88px] 
          xl:basis-[275px]">
          <div className="sticky top-0 h-dvh overflow-y-auto shrink-0 border-r border-white/10
            md:w-[88px] 
            xl:w-[275px]">
            <LeftSidebar />
          </div>
        </aside>

        <div className="flex-1 flex justify-start 
          md:basis-[600px] 
          xl:basis-[950px]">
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