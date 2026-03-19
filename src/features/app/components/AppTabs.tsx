"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["おすすめ", "フォロー中"] as const;

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("おすすめ");

  return (
    <div className="sticky top-14 z-20 border-b border-white/10 bg-black/80 backdrop-blur md:top-0">
      <div className="grid grid-cols-2">
        {tabs.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex h-14 items-center justify-center text-lg font-bold"
            >
              <span className={cn(active ? "text-white" : "text-white/45")}>
                {tab}
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