"use client";

import Link from "next/link";
// import { usePathname } from "next/navigation";
import { Home, Search, Bell, Mail } from "lucide-react";

import { LayerPortal } from "@/components/layer/LayerPortal";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: React.ElementType;
  url: string;
  isDisabled: boolean;
};

const navItems: NavItem[] = [
  { label: "ホーム", icon: Home, url: "/app", isDisabled: false, },
  { label: "話題を検索", icon: Search, url: "/search", isDisabled: false,  },
  { label: "通知", icon: Bell, url: "/notification", isDisabled: true,  },
  { label: "メッセージ", icon: Mail, url: "/messages", isDisabled: false,  },
];

export default function MobileBottomNav() {
  // const pathname = usePathname();

  return (
    <LayerPortal>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black text-white md:hidden">
        <div className="grid h-16 grid-cols-4 place-items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            // const isActive = item.url && pathname === item.url;
            const isDisabled = item.isDisabled;

            return (
              <Link
                key={item.label}
                href={item.url}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
                className={cn(
                  "flex h-full w-full items-center justify-center transition",
                  "hover:bg-white/10",
                  isDisabled && "pointer-events-none cursor-default opacity-50"

                )}
              >
                <Icon className="size-7" />
              </Link>
            );

          })}
        </div>
      </nav>
    </LayerPortal>
  );
}
