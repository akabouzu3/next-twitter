import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/features/follow/components/FollowButton";
import type { UserConnectionItem } from "@/features/user/types/user.types";

type Props = {
  user: UserConnectionItem;
};

export default function UserConnectionRow({ user }: Props) {
  return (
    // 行全体をプロフィールへのリンクにして、X/Twitter らしい広いクリック範囲にする。
    <Link
      href={`/users/${user.username}`}
      className="flex gap-3 border-b border-white/10 px-4 py-3 transition hover:bg-white/[0.03]"
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
        {/* 画像がないユーザーは名前の先頭文字をアバター代わりに表示する。 */}
        {user.image ? (
          <Image
            src={user.image}
            alt={`${user.name}のプロフィール画像`}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="grid size-full place-items-center text-base font-bold">
            {user.name.slice(0, 1)}
          </div>
        )}
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

          {/* 自分自身にはフォロー操作を出さない。 */}
          {!user.isMe && (
            <div
              className="shrink-0"
              onClick={(e) => {
                // 親の Link にクリックが伝わると、ボタン操作ではなくプロフィール遷移になってしまう。
                e.preventDefault();
                e.stopPropagation();
              }}
            >
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
