'use client'
import { Home, Search, Bell, Mail, Bookmark, User, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { generateImageUrl } from "@/lib/utils/image-url";

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
  const imageUrl = generateImageUrl();

  // return (
  //   <div className="flex min-h-full w-full flex-col px-2 py-2 md:items-end xl:items-stretch xl:px-3">
  //     <Link href={"/app"} className="mb-2 flex h-14 w-14 items-center justify-center rounded-full hover:bg-white/10">
  //       <span className="text-4xl font-semibold">X</span>
  //     </Link>
  
  //     <nav className="flex flex-col gap-1">
  //       {navItems.map((item) => {
  //         const Icon = item.icon;
  //         return item.isVisible && (
  //           <Link key={item.label} href={item.url} className="group">
  //             <span
  //               className="flex h-14 items-center rounded-full px-4 group-hover:bg-white/10
  //                 md:w-14 md:justify-center md:px-0
  //                 xl:w-fit xl:gap-4 xl:px-6"
  //             >
  //               <Icon className="size-7" />
  //               <span
  //                 className={cn(
  //                   "hidden text-[28px] text-white/80 xl:inline xl:text-2xl",
  //                   pathname === item.url ? "font-black text-white" : ""
  //                 )}
  //               >
  //                 {item.label}
  //               </span>
  //             </span>
  //           </Link>
  //         );
  //       })}
  //     </nav>
  
  //     <button className="mt-4 hidden h-14 rounded-full bg-white px-8 text-lg font-bold text-black xl:block cursor-pointer">
  //       ポストする
  //     </button>
  
  //     <button className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black xl:hidden cursor-pointer">
  //       +
  //     </button>
  
  //     <div className="mt-auto hidden items-center gap-3 rounded-full p-3 hover:bg-white/10 xl:flex cursor-pointer">
  //       <Image
  //           src={imageUrl}
  //           alt={"プロフィール画像"}
  //           width={40}
  //           height={40}
  //           className="size-10 rounded-full object-cover"
  //         />
  //       <div className="min-w-0">
  //         <p className="truncate font-bold">カズオだよ！</p>
  //         <p className="truncate text-sm text-white/50">@kazuo_33333</p>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex min-h-full w-full flex-col justify-between px-2 py-2
      md:items-center 
      xl:items-stretch xl:px-3">
      <div className="flex flex-col">
        <Link
          href="/app"
          className="mb-2 flex h-14 w-14 items-center justify-center rounded-full hover:bg-white/10 duration-200" 
        >
          <span className="text-4xl font-semibold">K</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              item.isVisible && (
                <Link key={item.label} href={item.url} className="group">
                  <span
                    className="flex h-14 items-center rounded-full group-hover:bg-white/10 duration-200
                      md:w-14 md:justify-center md:px-0
                      xl:w-fit xl:gap-4 xl:pl-4 xl:pr-6"
                  >
                    <Icon className="size-7" />
                    <span
                      className={cn(
                        "hidden xl:inline text-2xl text-white/80 ",
                        pathname === item.url ? "font-black text-white" : ""
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                </Link>
              )
            );
          })}
        </nav>

        <button className="mt-4 hidden h-14 rounded-full bg-white px-8 text-lg font-bold text-black cursor-pointer hover:bg-white/80 duration-200
          xl:block">
          ポストする
        </button>

        <button className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black cursor-pointer duration-200
          xl:hidden">
          +
        </button>
      </div>

      <div className="hidden items-center gap-3 rounded-full p-3 duration-200 hover:bg-white/10 cursor-pointer
        md:flex">
        <Image
          src={imageUrl}
          alt="プロフィール画像"
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
        <div className="min-w-0 hidden xl:block">
          <p className="truncate font-bold">カズオだよ！</p>
          <p className="truncate text-sm text-white/50">@kazuo_33333</p>
        </div>
      </div>
    </div>
  );
}