"use client";

import { useState, useTransition } from "react";
import { followUserAction } from "@/features/follow/actions/followUser";
import { unfollowUserAction } from "@/features/follow/actions/unfollowUser";

type Props = {
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    isFollowing: boolean;
  };
};

export function FollowButton({ user }: Props) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
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
          await followUserAction(user.id);
        } else {
          await unfollowUserAction(user.id);
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