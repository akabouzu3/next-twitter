"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BadgeCheck,
  ExternalLink,
  List,
  LogOut,
  Paintbrush,
  Plus,
  Settings,
  User,
  Users,
  Zap,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";
import type { ElementType } from "react";

import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  currentUser: CurrentUser | null;
  className?: string;
};

type SidebarProps = {
  currentUser: CurrentUser;
  onClose: () => void;
};

type MenuItem = {
  label: string;
  icon: ElementType;
  href?: string;
  disabled?: boolean;
  badge?: string;
};

// 画像の X mobile sidebar に寄せて、未実装機能も disabled の項目として並べる。
// href がある項目だけ遷移可能にし、他は見た目だけ先に揃えておく。
const menuItems: MenuItem[] = [
  // { label: "プレミアム", icon: BadgeCheck, disabled: true, badge: "1" },
  // { label: "リスト", icon: List, disabled: true },
  // { label: "コミュニティ", icon: Users, disabled: true },
  // { label: "クリエイタースタジオ", icon: Paintbrush, disabled: true },
  // { label: "ビジネス", icon: Zap, disabled: true },
  // { label: "広告", icon: ExternalLink, disabled: true },
  { label: "設定とプライバシー", icon: Settings, disabled: true },
];

function UserAvatar({
  currentUser,
  size = "size-8",
}: {
  currentUser: CurrentUser;
  size?: string;
}) {
  // header trigger と drawer 内の両方で同じ avatar 表示を使う。
  // 画像未設定時は空の丸ではなく、User icon を fallback として表示する。
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-zinc-800 text-white",
        size,
      )}
    >
      {currentUser.image ? (
        <Image
          src={currentUser.image}
          alt={currentUser.name ?? currentUser.username}
          fill
          className="object-cover"
          sizes="64px"
        />
      ) : (
        <User className="absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400" />
      )}
    </div>
  );
}

function MenuLink({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const Icon = item.icon;

  // disabled / link のどちらでも icon・label・badge の見た目を揃える。
  const content = (
    <>
      <Icon className="size-7 shrink-0" strokeWidth={2.5} />
      <span className="min-w-0 flex-1 truncate text-[24px] font-black leading-none">
        {item.label}
      </span>
      {item.badge ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[18px] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (item.disabled || !item.href) {
    // 未実装メニューは button disabled にして、キーボード操作でも遷移しないようにする。
    return (
      <button
        type="button"
        disabled
        className="flex h-[58px] w-full items-center gap-7 text-left text-white/50 disabled:cursor-default"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      // drawer 内リンクを押したら、ページ遷移前に drawer を閉じる。
      onClick={onClose}
      className="flex h-[58px] w-full items-center gap-7 text-white transition hover:text-white/80"
    >
      {content}
    </Link>
  );
}

export function MobileAccountSidebar({ currentUser, onClose }: SidebarProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/70 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 md:hidden" />
      <DialogPrimitive.Content
        className={cn(
          // 390px 幅の mobile viewport で参考画像に近い比率になるよう、drawer は約280pxにする。
          "fixed inset-y-0 left-0 z-50 flex w-[min(72vw,280px)] flex-col overflow-y-auto border-r border-white/10 bg-black px-4 pt-4 pb-8 text-white shadow-2xl outline-none md:hidden",
          // DialogContent を中央 modal ではなく、左から出る drawer として動かす。
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left",
        )}
      >
        <DialogPrimitive.Title className="sr-only">
          アカウントメニュー
        </DialogPrimitive.Title>

        <div className="mb-8 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <UserAvatar currentUser={currentUser} size="size-10" />
            <p className="mt-5 truncate text-[24px] font-black leading-tight">
              {currentUser.name}
            </p>
            <p className="truncate text-[18px] leading-tight text-zinc-500">
              @{currentUser.username}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[17px] leading-none">
              {/* CurrentUser の _count を使い、追加 fetch なしでフォロー数を表示する。 */}
              <Link
                href={`/users/${currentUser.username}/following`}
                onClick={onClose}
                className="transition hover:underline"
              >
                <span className="font-black">
                  {currentUser._count.following}
                </span>{" "}
                <span className="text-zinc-500">フォロー中</span>
              </Link>
              <Link
                href={`/users/${currentUser.username}/followers`}
                onClick={onClose}
                className="transition hover:underline"
              >
                <span className="font-black">
                  {currentUser._count.followers}
                </span>{" "}
                <span className="text-zinc-500">フォロワー</span>
              </Link>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-500 text-white/50 opacity-90 disabled:cursor-default"
            aria-label="アカウントを追加"
          >
            {/* 画像にある追加ボタンの位置だけ再現。アカウント追加機能はまだ未実装。 */}
            <Plus className="size-8" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          <MenuLink
            item={{
              label: "プロフィール",
              icon: User,
              href: `/users/${currentUser.username}`,
            }}
            onClose={onClose}
          />
          {menuItems.map((item) => (
            <MenuLink key={item.label} item={item} onClose={onClose} />
          ))}
        </nav>

        <div className="mt-8 border-t border-white/15 pt-6">
          <button
            type="button"
            onClick={() => {
              // signOut の redirect 前に drawer の open state も閉じておく。
              onClose();
              void signOut({ redirectTo: "/" });
            }}
            className="flex h-[58px] w-full items-center gap-7 text-left text-white transition hover:text-white/80"
          >
            <LogOut className="size-7 shrink-0" strokeWidth={2.5} />
            <span className="min-w-0 flex-1 truncate text-[24px] font-black leading-none">
              ログアウト
            </span>
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function MobileAccountSidebarTrigger({
  currentUser,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  // protected layout でも null の可能性は型として残るため、avatar trigger 自体を出さない。
  if (!currentUser) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
            className,
          )}
          aria-label="アカウントメニューを開く"
        >
          <UserAvatar currentUser={currentUser} />
        </button>
      </DialogPrimitive.Trigger>

      <MobileAccountSidebar
        currentUser={currentUser}
        onClose={() => setOpen(false)}
      />
    </DialogPrimitive.Root>
  );
}
