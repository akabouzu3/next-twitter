"use client";

import * as React from "react";
import { X } from "lucide-react";
import { UserEditForm } from "@/features/user/components/UserEditForm";
import { UserProfileItem } from "@/features/user/types/user.types";
import { LayerPortal } from "@/components/layer/LayerPortal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfileItem;
};

export function UserEditDialog({ 
  open,
  onOpenChange,
  user,
 }: Props) {
  // ヘッダーの保存ボタンは form の外側にあるため、同じ id で編集フォームへ submit を紐づける。
  const formId = React.useId();

  if (!open) {
    return null;
  }

  return (
    // 通常のページレイアウトの外へ出して、モーダルを画面全体に重ねる。
    <LayerPortal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black md:bg-slate-500/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-edit-dialog-title"
      >
        <div className="grid min-h-dvh md:place-items-center md:p-4">
          <div className="flex min-h-dvh w-full flex-col bg-black text-white shadow-2xl md:min-h-0 md:max-h-[90dvh] md:max-w-lg md:overflow-y-auto md:rounded-2xl">
            {/* ダイアログの固定ヘッダー。閉じる操作と保存操作をここに集約する。 */}
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between bg-black/60 px-4 py-2 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-6">
                <button
                  type="button"
                  aria-label="閉じる"
                  onClick={() => onOpenChange(false)}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                >
                  <X className="size-4" />
                </button>
                <h2
                  id="user-edit-dialog-title"
                  className="truncate text-xl font-bold tracking-wide"
                >
                  プロフィールを編集
                </h2>
              </div>
              {/* form 属性で下の UserEditForm を submit する。 */}
              <button
                type="submit"
                form={formId}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
              >
                保存
              </button>
            </div>

            <section className="border-b border-white/10 pb-4">
              {/* 更新成功後は詳細ページへ戻るため、このダイアログを閉じる。 */}
              <UserEditForm
                user={user}
                formId={formId}
                onSuccess={() => onOpenChange(false)}
              />
            </section>
          </div>
        </div>
      </div>
    </LayerPortal>
  );
}
