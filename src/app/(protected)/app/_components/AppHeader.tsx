"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import KLogo from "@/components/icons/KLogo";
import { MobileAccountSidebarTrigger } from "@/components/layout/MobileAccountSidebar";
import NavigationPendingIndicator from "@/components/navigation-pending-indicator";
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
        <div className="w-8" aria-hidden="true" />
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
              className="relative flex h-12 cursor-pointer items-center justify-center text-md font-bold transition hover:bg-white/10"
            >
              <span className={cn(active ? "text-white" : "text-white/45")}>
                {tab.title}
              </span>
              <NavigationPendingIndicator className="absolute right-4 top-1/2 -translate-y-1/2" />

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
