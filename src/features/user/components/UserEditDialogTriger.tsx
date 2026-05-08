"use client";

import * as React from "react";
// import { SquarePen } from "lucide-react";

import { cn } from "@/lib/utils";
import { CurrentUser } from "@/lib/auth/current-user";
import { UserEditDialog } from "@/features/user/components/UserEditDialog";
import { UserProfileItem } from "@/features/user/types/user.types";

type Props = {
  currentUser: CurrentUser | null;
  user: UserProfileItem;
  className?: string;
};

export default function UserEditDialogTrigger({
  currentUser,
  user,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);

  if (!currentUser) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="プロフィールを編集"
        className={cn(
          "h-10 rounded-full border border-neutral-600 px-4 text-sm font-bold transition cursor-pointer hover:bg-white/10 sm:text-base",
          className
        )}
      >
        プロフィールを編集
      </button>

      <UserEditDialog
        open={open}
        onOpenChange={setOpen}
        user={user}
      />
    </>
  );
}
