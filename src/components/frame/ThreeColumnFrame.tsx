
import LeftSidebar from "@/components/layout/LeftSidebar";
import React from "react";
import RightSidebar from "@/components/layout/RightSidebar";
import { RecommendedUser } from "@/features/user/types/user.types";
import { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  currentUser: CurrentUser | null;
  recommendUsers: RecommendedUser[];
  children: React.ReactNode;
};

export default async function ThreeColumnFrame({
  currentUser,
  recommendUsers,
  children,
}: Props) {

  return (
    <>
    <div className="min-h-dvh bg-black text-white">

      <div className="flex">
        <aside className="hidden md:flex flex-auto md:basis-[88px] xl:basis-[275px] justify-end">
          <div className="sticky top-0 h-dvh overflow-y-auto shrink-0 border-r border-white/10
            md:w-[88px] 
            xl:w-[275px]">
            <LeftSidebar currentUser={currentUser} />
          </div>
        </aside>

        <div className="min-w-0 flex-auto flex justify-start md:basis-[600px] xl:basis-[950px]">
          <main className="min-w-0 flex-1 basis-[600px] border-r border-white/10 md:max-w-[600px]">
            {children}
          </main>

          <aside className="hidden shrink-0
            xl:block xl:w-[350px]">
            <RightSidebar recommendUsers={recommendUsers}/>
          </aside>
          
        </div>
      </div>
    </div>
    </>
  );
}
