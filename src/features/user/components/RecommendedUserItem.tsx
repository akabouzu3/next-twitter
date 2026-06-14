import Link from "next/link";
import Image from "next/image";
import type { RecommendedUser } from "@/features/user/types/user.types";
import FollowButton from "@/features/follow/components/FollowButton";
import { getUserImageUrl } from "@/lib/utils/default-user-images";
// import type { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  // currentUser: CurrentUser | null;
  user: RecommendedUser
};

export function RecommendedUserItem({ user }: Props) {
  const userImageUrl = getUserImageUrl(user.image);

  return (
    <Link
      href={`/users/${user.username}`}
      className="
        flex w-full items-center gap-3 px-3 py-3 rounded-full
        transition hover:bg-white/10
      "
    >
      {/* icon */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-zinc-700">
        <Image
          src={userImageUrl}
          alt={user.name ?? ""}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      {/* name */}
      <div className="min-w-0 flex-1 xl:block hidden">
        <p className="truncate text-[15px] font-bold text-white">
          {user.name}
        </p>
        <p className="truncate text-[15px] text-zinc-500">
          @{user.username}
        </p>
      </div>

      {/* フォローボタン */}
      {/* <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // ← Link遷移を止める（重要）
          e.stopPropagation(); // ← 念のため
          console.log("follow:", user.id);
        }}
        className="
          rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black cursor-pointer
          hover:bg-zinc-200
        "
      >
        フォロー
      </button> */}
      <div
        onClick={(e) => {
          // Link への遷移を止める
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <FollowButton
          userId={user.id}
          isFollowing={user.isFollowing}
        />
      </div>
    </Link>
  );
}
