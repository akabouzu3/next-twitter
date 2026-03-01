// src/features/auth/components/LoginModal.tsx
"use client";

import { LayerPortal } from "@/components/layer/LayerPortal";
import SignupBody from "./SignupBody";

export function SignupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {

  return !open ? null : (
    <LayerPortal>
      <div className="md:hidden fixed inset-0 z-50 bg-black/60 overflow-y-auto overscroll-contain">
        {/* 中央寄せ担当 */}
        <div className="min-h-dvh flex items-center justify-center">
          {/* “モバイルは全画面”の中身 */}
          <div className="relative w-full min-h-dvh bg-black text-white flex flex-col gray-scrollbar">
            {/* header */}
            <div className="fixed top-0 right-0 left-0 z-10 bg-black/60 backdrop-blur-md shrink-0 flex justify-center p-4 border-b border-white/10">
              { (!onClose) ? null :(
                <button
                  type="button"
                  aria-label="閉じる"
                  onClick={onClose}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full cursor-pointer hover:bg-white/20">✕</button>
              )}
              <div className="text-3xl font-black">X</div>
            </div>

            {/* body: 短い時は中央、長い時はスクロール */}
            <div className="flex-1 min-h-full flex items-center justify-center px-8 py-30">
              <div className="w-full max-w-sm">
                <div className="mb-4 text-3xl font-bold">アカウントを作成</div>

                <SignupBody />

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block fixed inset-0 z-50 bg-slate-500/20 overflow-y-auto overscroll-contain">
        <div className="min-h-dvh p-4 grid place-items-center">
          <div className="overflow-y-auto gray-scrollbar w-full max-w-lg max-h-[90dvh] rounded-2xl bg-black text-white shadow-2xl flex flex-col">
            {/* header (固定) */}
            <div className="sticky z-1 top-0 bg-black/60 backdrop-blur-md shrink-0 flex justify-center p-4 border-b border-white/10">
              { (!onClose) ? null :(
                <button
                  type="button"
                  aria-label="閉じる"
                  onClick={onClose}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full cursor-pointer hover:bg-white/20">✕</button>
              )}
              <div className="text-3xl font-black">X</div>
            </div>

            {/* body */}
            <div className="flex-1 min-h-0">
              <div className="max-w-sm mx-auto p-4">
                <div className="mb-4 text-3xl font-bold">アカウントを作成</div>
                {/* 長い内容 */}
                <SignupBody/>
              </div>
            </div>
          </div>
        </div>
      </div>


    </LayerPortal>
  );
}
