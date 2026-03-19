'use client'
import { Home, Search, Bell, Mail, Bookmark, User, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "ホーム", icon: Home, url: "/app", isVisible: true, },
  { label: "話題を検索", icon: Search, url: "/app/search", isVisible: true,  },
  { label: "通知", icon: Bell, url: "/app/notification", isVisible: true,  },
  { label: "メッセージ", icon: Mail, url: "/app/messages", isVisible: true,  },
  { label: "ブックマーク", icon: Bookmark, url: "/app/bookmark", isVisible: true,  },
  { label: "プロフィール", icon: User, url: "/app/profile", isVisible: true,  },
  { label: "もっと見る", icon: Ellipsis, url: "/app/more", isVisible: true,  },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <div className="hidden md:flex flex-col h-dvh w-full px-2 py-2 md:items-end xl:items-stretch xl:px-3">
      <div className="mb-2 px-6 flex h-14 w-14 items-center justify-center rounded-full hover:bg-white/10">
        <span className="text-4xl font-semibold">X</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return item.isVisible && (
            <Link key={item.label} href={item.url} className="group">
              <button className="flex h-14 items-center rounded-full px-4 group-hover:bg-white/10 
                  md:w-14 md:justify-center md:px-0 
                  xl:w-fit xl:gap-4 xl:px-6">
                <Icon className="size-7" />
                <span className={cn("hidden text-[28px] xl:inline xl:text-2xl text-white/80",
                  pathname === item.url ? 'font-black text-white' : ""
                )}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </nav>

      <button className="mt-4 hidden h-14 rounded-full bg-white px-8 text-lg font-bold text-black xl:block">
        ポストする
      </button>

      <button className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black xl:hidden">
        +
      </button>

      <div className="mt-auto hidden items-center gap-3 rounded-full p-3 hover:bg-white/10 xl:flex">
        <div className="size-10 rounded-full bg-zinc-700" />
        <div className="min-w-0">
          <p className="truncate font-bold">カズオだよ！</p>
          <p className="truncate text-sm text-white/50">@kazuo_33333</p>
        </div>
      </div>
    </div>
  );
}