"use client";
import { UserProfile } from "@/features/user/server/get-user";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    title: "ポスト",
    segment: "",
    isDisabled: false,
  },
  {
    title: "返信",
    segment: "with_replies",
    isDisabled: true,
  },
  {
    title: "ハイライト",
    segment: "highlights",
    isDisabled: true,
  },
  {
    title: "記事",
    segment: "articles",
    isDisabled: true,
  },
  {
    title: "メディア",
    segment: "media",
    isDisabled: false,
  },
  {
    title: "いいね",
    segment: "likes",
    isDisabled: false,
  },
] as const;

type Props = {
  user: UserProfile;
};

export default function UserProfileTabs({
  user,
}: Props) {

  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          if (tab.isDisabled) return null;

          const href = `/users/${user.username}/${tab.segment}`;

          const isActive =
            tab.segment === ""
              ? pathname === `/users/${user.username}`
              : pathname.startsWith(href);

          return (
            <Link
              key={tab.title}
              href={href}
              className="relative min-w-[80px] flex-1 px-4 py-4 text-center text-[15px] font-bold transition hover:bg-white/10"
            >
              <span className={isActive ? "text-white" : "text-neutral-500"}>
                {tab.title}
              </span>

              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-sky-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}