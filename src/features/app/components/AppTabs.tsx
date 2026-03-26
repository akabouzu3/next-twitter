"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { title } from "process";

const tabs = [
  {
    title: "おすすめ",
    isDisabled: true,
  },
  {
    title: "フォロー中",
    isDisabled: false,
  }] as const;

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<String>("フォロー中");

  return (
    <div className="sticky top-14 md:top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur ">
      <div className="grid grid-cols-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.title;

          return (
            <button
              key={tab.title}
              onClick={() => setActiveTab(tab.title)}
              className={cn("relative flex h-14 items-center justify-center text-lg font-bold cursor-pointer hover:bg-white/10",
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
    </div>
  );
}