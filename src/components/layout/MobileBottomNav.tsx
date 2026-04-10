"use client";

import { Home, Search, Bell, Mail } from "lucide-react";
import { LayerPortal } from "@/components/layer/LayerPortal";

export default function MobileBottomNav() {
  return (
    <LayerPortal>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 text-white bg-black md:hidden">
        <div className="grid h-16 grid-cols-4 place-items-center">
          <button><Home className="size-7" /></button>
          <button><Search className="size-7" /></button>
          <button><Bell className="size-7" /></button>
          <button><Mail className="size-7" /></button>
        </div>
      </nav>
    </LayerPortal>
  );
}