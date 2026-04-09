"use client";

import * as React from "react";
import { SquarePen } from "lucide-react";

import { cn } from "@/lib/utils";
import { CurrentUser } from "@/lib/auth/current-user";
import PostComposerDialog from "@/features/post/components/PostComposerDialog";

type PostDialogTriggerProps = {
  currentUser: CurrentUser | null;
  className?: string;
};

export function PostDialogTrigger({
  currentUser,
  className,
}: PostDialogTriggerProps) {
  const [open, setOpen] = React.useState(false);

  if (!currentUser) return null;

  return (
    <>
      {/* PC用 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "mt-4 hidden h-14 rounded-full bg-white px-8 text-lg font-bold text-black transition hover:bg-white/80 xl:block",
          className
        )}
      >
        ポストする
      </button>

      {/* mobile / tablet用 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="投稿を作成"
        className={cn(
          "mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/80 xl:hidden",
          className
        )}
      >
        <SquarePen className="size-6" />
      </button>


      <PostComposerDialog
        open={open}
        onOpenChange={setOpen}
        currentUser={currentUser}
      />
    </>
  );
}