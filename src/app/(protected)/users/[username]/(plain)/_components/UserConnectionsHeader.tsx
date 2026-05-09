"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { UserProfileItem } from "@/features/user/types/user.types";

type Props = {
  user: UserProfileItem;
  activeTab: "followers" | "following";
};

const tabs = [
  {
    key: "followers",
    label: "フォロワー",
  },
  {
    key: "following",
    label: "フォロー中",
  },
] as const;

export default function UserConnectionsHeader({ user, activeTab }: Props) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/users/${user.username}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="flex h-[53px] items-center gap-6 px-2">
        <Link
          href={`/users/${user.username}`}
          onClick={handleBack}
          aria-label="戻る"
          className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky-500"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold leading-6">
            {user.name ?? user.username}
          </h1>
          <p className="truncate text-sm leading-5 text-neutral-500">
            @{user.username}
          </p>
        </div>
      </div>

      <nav className="grid h-[53px] grid-cols-2" aria-label="ユーザー関係">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const href = `/users/${user.username}/${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex items-center justify-center text-[15px] font-bold text-neutral-500 transition hover:bg-white/10"
            >
              <span className={isActive ? "text-white" : undefined}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-1 w-16 rounded-full bg-sky-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
