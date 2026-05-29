"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import KLogo from "@/components/icons/KLogo";
import { MobileAccountSidebarTrigger } from "@/components/layout/MobileAccountSidebar";
import type { CurrentUser } from "@/lib/auth/current-user";

const tabs = [
  {
    key: "recommended",
    title: "おすすめ",
    href: "/app",
  },
  {
    key: "following",
    title: "フォロー中",
    href: "/app?feed=following",
  },
] as const;

type AppFeed = (typeof tabs)[number]["key"];

type Props = {
  activeFeed: AppFeed;
  currentUser: CurrentUser | null;
}

export default function AppPageHeader({
  activeFeed,
  currentUser,
}:Props) {
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
          const active = activeFeed === tab.key;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="relative flex h-12 items-center justify-center text-md font-bold cursor-pointer hover:bg-white/10"
            >
              <span className={cn(active ? "text-white" : "text-white/45")}>
                {tab.title}
              </span>

              {active && (
                <span className="absolute bottom-0 h-1 w-14 rounded-full bg-sky-500" />
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
