import Image from "next/image";
import { CalendarDays, BadgeCheck, ChevronRight } from "lucide-react";
import { CurrentUser } from "@/lib/auth/current-user";
import FollowButton from "@/features/follow/components/FollowButton";
import { UserProfileItem } from "@/features/user/types/user.types";
import UserEditDialogTrigger from "@/features/user/components/UserEditDialogTriger";
import Link from "next/link";
import StartDirectConversationButton from "@/features/messages/components/StartDirectConversationButton";

type Props = {
  currentUser: CurrentUser | null;
  user: UserProfileItem;
};

export default function UserProfile({ currentUser, user }: Props) {
  // 🔑 自分のプロフィールかどうか判定
  // → UI出し分け（編集ボタン or フォローボタン）
  const isMe = currentUser?.id === user.id;

  return (
    <section>
      {/* =========================
         ヘッダー画像（カバー画像）
      ========================= */}
      <div className="relative h-[120px] sm:h-[200px] bg-neutral-900 ">
        {user.backgroundImage ? (
          <Image
            src={user.backgroundImage}
            alt=""
            fill
            priority
            className="object-cover"
            // 📱 レスポンシブ対応
            // モバイル: 100vw / PC: 600px
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          // 画像がない場合のフォールバック
          <div className="size-full bg-neutral-800" />
        )}
      </div>

      <div className="px-4 pb-4">
        {/* =========================
           プロフィール画像 + ボタン
        ========================= */}
        <div className="relative flex justify-end">

          {/* 🧠 アバター（カバーに重ねる） */}
          <div className="absolute -top-10 left-0 size-[88px] overflow-hidden rounded-full border-4 border-black bg-neutral-900 sm:-top-16 sm:size-[134px]">
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.name ?? user.username}のプロフィール画像`}
                fill
                className="object-cover"
                sizes="134px"
              />
            ) : (
              // 👤 画像がない場合はイニシャル表示
              <div className="grid size-full place-items-center bg-neutral-800 text-3xl font-bold">
                {(user.name ?? user.username).slice(0, 1)}
              </div>
            )}
          </div>

          {/* 🧠 ボタンエリア（右上） */}
          <div className="pt-3">
            {isMe ? (
              // 自分 → 編集ボタン
              <UserEditDialogTrigger currentUser={currentUser} user={user}/>
            ) : (
              <div className="flex items-center gap-2">
                <StartDirectConversationButton username={user.username} />
                <FollowButton userId={user.id} isFollowing={user.isFollowing}/>
              </div>
            )}
          </div>
        </div>

        {/* =========================
           ユーザー情報
        ========================= */}
        <div className="pt-10">
          
          {/* 🧠 名前 + 認証バッジ */}
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold leading-7">
              {user.name ?? user.username}
            </h2>

            {/* ⚠️ 今は全員表示されてるので注意
               → 本来は isVerified 的なフラグで出し分ける */}
            <span className="inline-flex h-7 items-center gap-1 rounded-full border border-neutral-600 px-2 text-xs font-bold">
              <BadgeCheck className="size-4 fill-sky-500 text-black" />
              認証される
            </span>
          </div>

          {/* 🧠 ユーザー名 */}
          <p className="mt-1 text-[15px] text-neutral-500">
            @{user.username}
          </p>

          {/* 🧠 自己紹介（改行保持） */}
          {user.bio && (
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-5">
              {user.bio}
            </p>
          )}

          {/* 🧠 登録日 */}
          <div className="mt-4 flex items-center gap-1 text-[15px] text-neutral-500">
            <CalendarDays className="size-4" />
            <span>
              {user.createdAt.getFullYear()}年
              {user.createdAt.getMonth() + 1}月からXを利用しています
            </span>

            {/* 👉 本来は詳細ページへのリンク用っぽいUI */}
            <ChevronRight className="size-4" />
          </div>

          {/* =========================
             フォロー数
          ========================= */}
          <div className="mt-4 flex gap-5 text-[15px]">
            
            {/* フォロー中 */}
            <Link href={`/users/${user.username}/following`}>
              <span className="font-bold text-white">
                {user.followingCount}
              </span>{" "}
              <span className="text-neutral-500">フォロー中</span>
            </Link>

            {/* フォロワー */}
            <Link href={`/users/${user.username}/followers`}>
              <span className="font-bold text-white">
                {user.followerCount}
              </span>{" "}
              <span className="text-neutral-500">フォロワー</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
