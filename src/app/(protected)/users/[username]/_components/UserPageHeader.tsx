import { Search } from "lucide-react";
import { UserProfile } from "@/features/user/server/get-user";

type Props = {
  user: UserProfile;
};

export default function UserPageHeader({
  user,
}: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-[53px] items-center justify-between border-b border-white/10 bg-black/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="戻る"
          className="grid size-9 place-items-center rounded-full transition hover:bg-white/10"
        >
          ←
        </button>

        <div>
          <h1 className="text-xl font-bold leading-6">
            {user.name ?? user.username}
          </h1>
          <p className="text-sm leading-5 text-neutral-500">
            {user._count.posts} 件のポスト
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="検索"
        className="grid size-9 place-items-center rounded-full transition hover:bg-white/10"
      >
        <Search className="size-5" />
      </button>
    </header>
    
  )
}
