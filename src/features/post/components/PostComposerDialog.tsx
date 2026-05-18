"use client";

import * as React from "react";
import {
  ArrowLeft,
  X,

} from "lucide-react";


import PostComposer from "./PostComposer";
import { CurrentUser } from "@/lib/auth/current-user";
import { LayerPortal } from "@/components/layer/LayerPortal";


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

  return !open ? null : (
    <LayerPortal>
      {/* モバイル */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/60 overflow-y-auto overscroll-contain">
        {/* 中央寄せ担当 */}
        <div className="min-h-dvh flex items-center justify-center">
          {/* “モバイルは全画面”の中身 */}
          <div className="relative w-full min-h-dvh bg-black text-white flex flex-col gray-scrollbar">
            {/* header */}
            <div className="sticky top-0 z-10 flex px-4 py-4  bg-black/60 backdrop-blur-md">
              { (!onOpenChange) ? null :(
                <button
                  type="button"
                  aria-label="閉じる"
                  onClick={()=> onOpenChange(false)}
                  className="grid place-items-center size-8 rounded-full cursor-pointer hover:bg-white/20"
                >
                  <ArrowLeft className="size-5" />
                </button>
              )}

            </div>

            {/* body: 短い時は中央、長い時はスクロール */}
            <div className="flex-1 min-h-full flex justify-center">
              <div className="w-full">
                {/** 投稿部分 */}
                <section className="border-b border-white/10 px-4 py-4">
                  <PostComposer 
                    currentUser={currentUser}
                    onSuccess={() => onOpenChange(false)} />
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タブレット以上 */}
      <div className="hidden md:block fixed inset-0 z-50 bg-slate-500/20 overflow-y-auto overscroll-contain">
        <div className="min-h-dvh p-4 grid place-items-center">
          <div className="overflow-y-auto gray-scrollbar w-full max-w-lg max-h-[90dvh] rounded-2xl bg-black text-white shadow-2xl flex flex-col">
            {/* header (固定) */}
            <div className="sticky z-1 top-0 bg-black/60 backdrop-blur-md shrink-0 flex justify-center p-4 ">
              { (!onOpenChange) ? null :(
                <button
                  type="button"
                  aria-label="閉じる"
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 left-4 grid place-items-center size-8 rounded-full cursor-pointer transition hover:bg-white/20"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            {/* body */}
            <div className="flex-1 min-h-0">
              <div className="mx-auto p-4">
                {/** 投稿部分 */}
                <section className="border-b border-white/10 px-4 py-4">
                  <PostComposer 
                    currentUser={currentUser}
                   onSuccess={() => onOpenChange(false)} />
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>


    </LayerPortal>
  );
}

