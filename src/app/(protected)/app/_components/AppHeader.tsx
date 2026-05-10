"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import KLogo from "@/components/icons/KLogo";
import { MobileAccountSidebarTrigger } from "@/components/layout/MobileAccountSidebar";
import type { CurrentUser } from "@/lib/auth/current-user";

const tabs = [
  {
    title: "おすすめ",
    isDisabled: true,
  },
  {
    title: "フォロー中",
    isDisabled: false,
  }] as const;

type Props = {
  currentUser: CurrentUser | null;
}

export default function AppPageHeader({
  currentUser,
}:Props) {
  const [activeTab, setActiveTab] = useState<string>("フォロー中");

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur ">
      {/**
       * モバイル限定：header
       */}
      <div className="md:hidden flex h-14 items-center justify-between px-4">
        <MobileAccountSidebarTrigger currentUser={currentUser} />
        <div className="w-8 h-8">
          <KLogo/>
        </div>
        <button 
          className="rounded-full border border-white/30 px-4 py-2 font-bold cursor-pointer
            disabled:pointer-events-none disabled:cursor-default disabled:opacity-50"
          disabled={true}>
          購入する
        </button>
      </div>

      {/**
       * 切り替えタブ
       */}
      <div className="grid grid-cols-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.title;

          return (
            <button
              key={tab.title}
              onClick={() => setActiveTab(tab.title)}
              className={cn("relative flex h-12 items-center justify-center text-md font-bold cursor-pointer hover:bg-white/10",
                tab.isDisabled ? "cursor-not-allowed" : ""
              )}
              disabled={tab.isDisabled}
            >
              <span className={cn(active ? "text-white" : "text-white/45")}>
                {tab.title}
              </span>

              {active && (
                <span className="absolute bottom-0 h-1 w-14 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
