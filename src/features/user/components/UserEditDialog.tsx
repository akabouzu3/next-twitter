"use client";

import { X } from "lucide-react";
import { UserEditForm } from "@/features/user/components/UserEditForm";
import { UserProfileItem } from "@/features/user/types/user.types";
import { LayerPortal } from "@/components/layer/LayerPortal";
import { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: CurrentUser;
  user: UserProfileItem;
};

export function UserEditDialog({ 
  open,
  onOpenChange,
  // currentUser,
  user,
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
            <div className="sticky z-1 top-0 bg-black/60 backdrop-blur-md shrink-0 flex items-center justify-between px-4 py-2 ">
              <div className="flex items-center gap-6">
                { (!onOpenChange) ? null :(
                  <button
                    type="button"
                    aria-label="閉じる"
                    onClick={() => onOpenChange(false)}
                    className="grid place-items-center size-8 rounded-full cursor-pointer transition hover:bg-white/20"
                  >
                    <X className="size-4" />
                  </button>
                )}
                <h2 className="text-xl font-bold tracking-wider">プロフィールを編集</h2>
              </div>
              <div className="flex items-center">
                <button
                  type="submit"
                  form="edit-form" 
                  className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black hover:bg-neutral-200">
                  保存
                </button>
              </div>

            </div>

            {/* body: 短い時は中央、長い時はスクロール */}
            <div className="flex-1 min-h-full flex justify-center">
              <div className="w-full">
                {/** 投稿部分 */}
                <section className="border-b border-white/10 pb-4">
                  <UserEditForm user={user}/>
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
            <div className="sticky z-1 top-0 bg-black/60 backdrop-blur-md shrink-0 flex items-center justify-between px-4 py-2 ">
              <div className="flex items-center gap-6">
                { (!onOpenChange) ? null :(
                  <button
                    type="button"
                    aria-label="閉じる"
                    onClick={() => onOpenChange(false)}
                    className="grid place-items-center size-8 rounded-full cursor-pointer transition hover:bg-white/20"
                  >
                    <X className="size-4" />
                  </button>
                )}
                <h2 className="text-xl font-bold tracking-wider">プロフィールを編集</h2>
              </div>
              <div className="flex items-center">
                <button
                  type="submit"
                  form="edit-form"
                  className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black hover:bg-neutral-200">
                  保存
                </button>
              </div>

            </div>

            {/* body */}
            <div className="flex-1 min-h-0">
              <div className="mx-auto">
                {/** 投稿部分 */}
                <section className="border-b border-white/10 px-1 pb-4">
                  <UserEditForm user={user} /> 
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayerPortal>
  );
}