"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, 
  // Search,
 } from "lucide-react";
import { UserProfileItem } from "@/features/user/types/user.types";

type Props = {
  user: UserProfileItem;
};

export default function UserPageHeader({
  user,
}: Props) {

  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();

    // 履歴があるかチェック
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/app"); // fallback
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-[53px] items-center justify-between border-b border-white/10 bg-black/80 px-2 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link
          href="/home" // fallback
          onClick={handleBack}
          className="grid size-9 place-items-center rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold leading-6">
            {user.name ?? user.username}
          </h1>
          <p className="text-sm leading-5 text-neutral-500">
            {user.postCount} 件のポスト
          </p>
        </div>
      </div>

      {/* <button
        type="button"
        aria-label="検索"
        className="grid size-9 place-items-center rounded-full transition hover:bg-white/10 cursor-pointer"
      >
        <Search className="size-5" />
      </button> */}
    </header>
    
  )
}
