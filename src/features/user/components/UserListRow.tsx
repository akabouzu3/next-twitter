import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/features/follow/components/FollowButton";
import type { UserListItem } from "@/features/user/types/user.types";
import { getUserImageUrl } from "@/lib/utils/default-user-images";

type Props = {
  user: UserListItem;
};

export default function UserListRow({ user }: Props) {
  const userImageUrl = getUserImageUrl(user.image);

  return (
    <Link
      href={`/users/${user.username}`}
      className="flex gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
        <Image
          src={userImageUrl}
          alt={`${user.name}のプロフィール画像`}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-5 text-white">
              {user.name}
            </p>
            <p className="truncate text-[15px] leading-5 text-neutral-500">
              @{user.username}
            </p>
          </div>

          {!user.isMe && (
            <div className="shrink-0">
              <FollowButton
                userId={user.id}
                isFollowing={user.isFollowing}
              />
            </div>
          )}
        </div>

        {user.bio && (
          <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[15px] leading-5 text-white">
            {user.bio}
          </p>
        )}
      </div>
    </Link>
  );
}
