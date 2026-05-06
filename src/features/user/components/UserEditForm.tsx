"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { UserProfileItem } from "@/features/user/types/user.types";

type Props = {
  user: UserProfileItem;
};

export function UserEditForm({ user }: Props) {
  return (
    <form id="edit-form" className="flex flex-col">
      <div className="relative h-[120px] bg-neutral-900 sm:h-[200px]">
        {user.backgroundImage ? (
          <Image
            src={user.backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-neutral-800" />
        )}

        <button
          type="button"
          className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/60 transition hover:bg-black/70"
          aria-label="ヘッダー画像を変更"
        >
          <Camera className="size-5" />
        </button>
      </div>

      <div className="px-4">
        <div className="relative h-16">
          <div className="absolute -top-10 left-0 rounded-full bg-black p-1">
            <div className="relative size-[88px] overflow-hidden rounded-full bg-neutral-800">
              {user.image ? (
                <Image src={user.image} alt="" fill className="object-cover" />
              ) : null}

              <button
                type="button"
                className="absolute inset-0 grid place-items-center bg-black/45 transition hover:bg-black/55"
                aria-label="プロフィール画像を変更"
              >
                <Camera className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-6">
          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">名前</span>
            <input
              name="name"
              defaultValue={user.name ?? ""}
              maxLength={50}
              className="mt-1 w-full bg-transparent text-[17px] outline-none"
            />
          </label>

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">自己紹介</span>
            <textarea
              name="bio"
              defaultValue={user.bio ?? ""}
              maxLength={160}
              rows={3}
              className="mt-1 w-full resize-none bg-transparent text-[17px] outline-none"
            />
          </label>
        </div>
      </div>
    </form>
  );
}