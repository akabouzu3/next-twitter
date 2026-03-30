"use client";

import { useState, useTransition } from "react";
import { followUserAction } from "@/features/follow/actions/follow-user-action";
import { unfollowUserAction } from "@/features/follow/actions/unfollow-user-action";

type Props = {
  userId: string;
  isFollowing: boolean;
};

export default function FollowButton({ userId, isFollowing: initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 楽観的UI
    const next = !isFollowing;
    setIsFollowing(next);

    startTransition(async () => {
      try {
        if (next) {
          await followUserAction(userId);
        } else {
          await unfollowUserAction(userId);
        }
      } catch (e) {
        // エラー時ロールバック
        setIsFollowing(!next);
      }
    });
  };

  return (
    <form>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`
          rounded-full px-4 py-1.5 text-sm font-bold cursor-pointer
          ${isFollowing
            ? "border border-zinc-500 text-white hover:bg-red-500/10"
            : "bg-white text-black hover:bg-zinc-200"}
          disabled:opacity-50
        `}
      >
        {isFollowing ? "フォロー中" : "フォロー"}
      </button>
    </form>
  );
}