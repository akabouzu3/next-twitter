// src/features/auth/components/LoginModal.tsx
"use client";

import { LayerPortal } from "@/components/layer/LayerPortal";
import { Button } from "@/components/ui/button";

export function LoginBanner({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <LayerPortal>
      {/* overlay */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid place-items-center bg-sky-400">
        {/* banner */}
        <div className="">
          <Button>ログイン</Button>
          <Button>登録</Button>
        </div>
      </div>
    </LayerPortal>
    
  );
}
