import Image from "next/image";
import { CalendarDays, BadgeCheck, ChevronRight } from "lucide-react";

import { CurrentUser } from "@/lib/auth/current-user";

type UserProfileHeaderUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  backgroundImage: string | null;
  bio?: string | null;
  createdAt: Date;
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
};

type Props = {
  currentUser: CurrentUser | null;
  user: UserProfileHeaderUser;
};

export default function UserProfile({ currentUser, user }: Props) {
  const isMe = currentUser?.id === user.id;

  return (
    <section>
      <div className="relative h-[120px] bg-neutral-900 sm:h-[200px]">
        {user.backgroundImage ? (
          <Image
            src={user.backgroundImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <div className="size-full bg-neutral-800" />
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="relative flex justify-end">
          <div className="absolute -top-10 left-0 size-[88px] overflow-hidden rounded-full border-4 border-black bg-neutral-900 sm:-top-16 sm:size-[134px]">
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.name ?? user.username}のプロフィール画像`}
                fill
                className="object-cover"
                sizes="134px"
              />
            ) : (
              <div className="grid size-full place-items-center bg-neutral-800 text-3xl font-bold">
                {(user.name ?? user.username).slice(0, 1)}
              </div>
            )}
          </div>

          <div className="pt-3">
            {isMe ? (
              <button
                type="button"
                className="h-10 rounded-full border border-neutral-600 px-4 text-sm font-bold transition hover:bg-white/10 sm:text-base"
              >
                プロフィールを編集
              </button>
            ) : (
              <button
                type="button"
                className="h-10 rounded-full bg-white px-5 text-sm font-bold text-black transition hover:bg-neutral-200"
              >
                フォロー
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold leading-7">
              {user.name ?? user.username}
            </h2>

            <span className="inline-flex h-7 items-center gap-1 rounded-full border border-neutral-600 px-2 text-xs font-bold">
              <BadgeCheck className="size-4 fill-sky-500 text-black" />
              認証される
            </span>
          </div>

          <p className="mt-1 text-[15px] text-neutral-500">@{user.username}</p>

          {user.bio && (
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-5">
              {user.bio}
            </p>
          )}

          <div className="mt-4 flex items-center gap-1 text-[15px] text-neutral-500">
            <CalendarDays className="size-4" />
            <span>
              {user.createdAt.getFullYear()}年
              {user.createdAt.getMonth() + 1}月からXを利用しています
            </span>
            <ChevronRight className="size-4" />
          </div>

          <div className="mt-4 flex gap-5 text-[15px]">
            <div>
              <span className="font-bold text-white">
                {user._count.following}
              </span>{" "}
              <span className="text-neutral-500">フォロー中</span>
            </div>

            <div>
              <span className="font-bold text-white">
                {user._count.followers}
              </span>{" "}
              <span className="text-neutral-500">フォロワー</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}