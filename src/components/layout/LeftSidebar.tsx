'use client'
import { Home, Search, Bell, Mail, User, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarAccountMenu } from "./SidebarAccountMenu";
import { CurrentUser } from "@/lib/auth/current-user";
import KLogo from "@/components/icons/KLogo";
import NavigationPendingIndicator from "@/components/navigation-pending-indicator";
import PostDialogTrigger from "@/features/post/components/PostComposerTrigger";



type Props = {
  currentUser: CurrentUser | null;
};

export default function LeftSidebar({currentUser}: Props) {
  const navItems = [
    { label: "ホーム", icon: Home, url: "/app", isDisabled: false, },
    { label: "話題を検索", icon: Search, url: "/search", isDisabled: false,  },
    { label: "通知", icon: Bell, url: "/notification", isDisabled: true,  },
    { label: "メッセージ", icon: Mail, url: "/messages", isDisabled: false,  },
    { label: "プロフィール", icon: User, url: "/users/" + currentUser?.username, isDisabled: false,  },
    { label: "もっと見る", icon: Ellipsis, url: "/more", isDisabled: true,  },
  ];

  const pathname = usePathname();

  return (
    <div className="flex min-h-full w-full flex-col justify-between px-2 py-2
      md:items-center 
      xl:items-stretch xl:px-3">
      <div className="flex flex-col">
        <Link
          href="/app"
          className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-full p-2 duration-200 hover:bg-white/10"
        >
          <KLogo/>
          <NavigationPendingIndicator className="absolute right-1 top-1" />
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = item.isDisabled;
            const isActive =
              item.url === "/app"
                ? pathname === item.url
                : pathname.startsWith(item.url);

            return (
              <Link key={item.label} href={item.url} className={cn(
                "group relative",
                isDisabled && "pointer-events-none cursor-default opacity-50"
              )}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
              >
                <span
                  className="flex h-14 items-center rounded-full group-hover:bg-white/10 duration-200
                    md:w-14 md:justify-center md:px-0
                    xl:w-fit xl:gap-4 xl:pl-4 xl:pr-6"
                >
                  <Icon className="size-7" />
                  <span
                    className={cn(
                      "hidden xl:inline text-2xl text-white/80 ",
                      isActive ? "font-black text-white" : ""
                    )}
                  >
                    {item.label}
                  </span>
                  {!isDisabled && (
                    <NavigationPendingIndicator className="absolute right-2 top-2 xl:static xl:ml-auto" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <PostDialogTrigger currentUser={currentUser} />
      </div>
      
      <div className="mt-6">
        <SidebarAccountMenu currentUser={currentUser}/>
      </div>
    </div>
  );
}
