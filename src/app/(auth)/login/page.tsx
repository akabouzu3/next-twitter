"use client";
// app/(auth)/login/page.tsx
import { LoginModal } from "@/features/auth/components/LoginModal";
import { useState } from "react";

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
    <div className="min-h-dvh bg-black text-white">
      <div className="mx-auto max-w-6xl min-h-dvh grid grid-cols-2 items-center px-10">
        {/* 左: 巨大X */}
        <div className="flex items-center justify-center">
          <div className="text-[220px] leading-none font-black text-slate-200/80 select-none">
            X
          </div>
        </div>

        {/* 右: コピー（画像にある雰囲気） */}
        <div className="text-slate-200">
          <div className="text-5xl font-bold tracking-tight">
            すべての話題が、ここに。
          </div>
        </div>
      </div>
    </div>

    <LoginModal open={isOpen} />
    </>
  );
}
