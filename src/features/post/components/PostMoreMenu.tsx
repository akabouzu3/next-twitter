"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MoreHorizontal, Trash2, UserMinus, UserPlus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { followUserAction } from "@/features/follow/actions/follow-user-action";
import { unfollowUserAction } from "@/features/follow/actions/unfollow-user-action";
import { deletePostAction } from "@/features/post/actions/delete-post-action";

type Props = {
  postId: string;
  authorId: string;
  canDelete: boolean;
  isOwnPost: boolean;
  isFollowingAuthor: boolean;
};

export default function PostMoreMenu({
  postId,
  authorId,
  canDelete,
  isOwnPost,
  isFollowingAuthor,
}: Props) {
  const router = useRouter();
  // メニュー内の表示を即時に切り替えるため、初期値を props からローカル状態へコピーする。
  const [isFollowing, setIsFollowing] = useState(isFollowingAuthor);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // フォロー操作は削除権限ではなく、投稿者が自分自身かどうかで判断する。
  const canFollowAuthor = !isOwnPost;

  function handleFollowToggle() {
    const next = !isFollowing;
    // 先に UI を更新し、失敗した場合だけ元の状態へ戻す。
    setIsFollowing(next);
    setMessage(null);

    startTransition(async () => {
      try {
        if (next) {
          await followUserAction(authorId);
        } else {
          await unfollowUserAction(authorId);
        }

        // Server Component のフィードを再取得し、フォロー状態や件数をサーバーの最新状態に揃える。
        router.refresh();
      } catch (error) {
        console.error(error);
        // Server Action が失敗したら楽観更新を取り消して、メニュー内にエラーを表示する。
        setIsFollowing(!next);
        setMessage("フォロー状態の更新に失敗しました。");
      }
    });
  }

  function handleDelete() {
    // 削除は取り消せない操作なので、Server Action を呼ぶ前にブラウザ標準の確認を挟む。
    const shouldDelete = window.confirm("この投稿を削除しますか？");

    if (!shouldDelete) {
      return;
    }

    startTransition(async () => {
      const result = await deletePostAction(postId);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      // 削除後の投稿一覧を Server Component 側から再取得し、消えた投稿を画面に反映する。
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="その他"
          className="grid size-9 shrink-0 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-48 border-white/10 bg-black text-white"
      >
        {canDelete ? (
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-3 text-red-400 focus:bg-red-500/10 focus:text-red-300"
            disabled={isPending}
            onSelect={(event) => {
              // DropdownMenu の既定の選択処理で閉じる前に、確認ダイアログと削除処理を走らせる。
              event.preventDefault();
              handleDelete();
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            削除
          </DropdownMenuItem>
        ) : null}
        {canFollowAuthor ? (
          <DropdownMenuItem
            className="cursor-pointer gap-3 focus:bg-white/10 focus:text-white"
            disabled={isPending}
            onSelect={(event) => {
              // フォロー状態の切り替え結果を、メニューを開いたまま表示へ反映する。
              event.preventDefault();
              handleFollowToggle();
            }}
          >
            {isFollowing ? (
              <UserMinus className="size-4" aria-hidden="true" />
            ) : (
              <UserPlus className="size-4" aria-hidden="true" />
            )}
            {isFollowing ? "フォロー解除" : "フォロー"}
          </DropdownMenuItem>
        ) : null}
        {message ? (
          <p className="px-2 py-1 text-xs text-red-400">{message}</p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
