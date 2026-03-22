"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { ChevronDown, Ellipsis } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  currentUser: CurrentUser | null;
};

export function SidebarAccountMenu({ currentUser }: Props) {
  console.log(currentUser);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="
            flex w-full items-center gap-3 rounded-full px-3 py-3 text-left
            transition hover:bg-white/10
            focus:outline-none
          "
          aria-label="アカウントメニューを開く"
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-zinc-700">
            {currentUser?.image ? (
              <Image
                src={currentUser.image}
                alt={currentUser.name ?? ""}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 xl:block hidden">
            <p className="truncate text-[15px] font-bold text-white">
              {currentUser?.name}
            </p>
            <p className="truncate text-[15px] text-zinc-500">
              @{currentUser?.username}
            </p>
          </div>

          <div className="hidden xl:flex items-center text-white">
            <Ellipsis className="size-5" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={12}
        className="
          w-[300px] rounded-2xl border border-white/10 bg-black p-2 text-white
          shadow-[0_0_20px_rgba(255,255,255,0.08)]
        "
      >
        <DropdownMenuItem
          className="
            cursor-pointer rounded-xl px-4 py-3 text-[15px] font-bold
            focus:bg-white/10 focus:text-white
          "
          onSelect={(e) => {
            e.preventDefault();
            // ここは後でアカウント追加モーダルなどに差し替え
          }}
        >
          既存のアカウントを追加
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-white/10" />

        <DropdownMenuItem
          className="
            cursor-pointer rounded-xl px-4 py-3 text-[15px] font-bold
            focus:bg-white/10 focus:text-white
          "
          onSelect={(e) => {
            e.preventDefault();
            void signOut({ redirectTo: "/" });
          }}
        >
          @{currentUser?.username} からログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}