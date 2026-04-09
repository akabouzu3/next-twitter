"use client";

import * as React from "react";
import {
  ArrowLeft,
  X,

} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import PostComposer from "./PostComposer";
import { CurrentUser } from "@/lib/auth/current-user";


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: CurrentUser;
};


export default function PostComposerDialog({
  open,
  onOpenChange,
  currentUser,
}: Props) {

  const closeLabel = open ? "投稿ダイアログを閉じる" : "投稿ダイアログを開く";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden border-zinc-800 bg-black p-0 text-white shadow-2xl",
          "fixed inset-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:left-1/2 sm:top-12 sm:h-auto sm:max-h-[90dvh] sm:w-[min(600px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:translate-y-0 sm:rounded-2xl"
        )}
      >
        <DialogTitle className="sr-only">投稿を作成</DialogTitle>
        <DialogDescription className="sr-only">
          テキストや画像を入力して新しい投稿を作成します。
        </DialogDescription>

        <header className="flex h-14 shrink-0 items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                className="inline-flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:hidden"
              >
                <ArrowLeft className="size-5" />
              </button>

              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                className="hidden size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:inline-flex"
              >
                <X className="size-5" />
              </button>
            </div>

            <button
              type="button"
              className="text-[15px] font-bold text-sky-500 transition hover:opacity-80"
            >
              下書き
            </button>

            {/* <Button
              type="submit"
              disabled={isDisabled}
              className={cn(
                "h-9 rounded-full px-4 text-[17px] font-bold text-black",
                "bg-white hover:bg-white/90 disabled:bg-sky-700/70 disabled:text-white/70",
                "sm:hidden"
              )}
            >
              ポストする
            </Button> */}
          </header>

          {/** 投稿部分 */}
          <section className="border-b border-white/10 px-4 py-4">
            <PostComposer 
              currentUser={currentUser}
              onSuccess={() => onOpenChange(false)} />
          </section>
      </DialogContent>
    </Dialog>
  );
}

