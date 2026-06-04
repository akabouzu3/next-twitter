"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { likePostAction } from "@/features/post/actions/like-post-action";
import { unlikePostAction } from "@/features/post/actions/unlike-post-action";
import { cn } from "@/lib/utils";

type Props = {
  // 操作対象の投稿ID。
  postId: string;

  // Server Componentで取得した現在ユーザーの初期いいね状態。
  initialLiked: boolean;

  // Server Componentで取得した初期いいね数。
  initialLikeCount: number;
};

/**
 * 投稿のいいね / いいね解除ボタン。
 *
 * クリック後すぐにUIを更新し、Server Actionが失敗した場合だけ元に戻す。
 */
export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  /**
   * startTransition 内で実行した Server Action の処理中は isPending が true になる。
   * ここではボタンを disabled にして、同じ投稿への連続クリックを防ぐために使う。
   */
  const [isPending, startTransition] = useTransition();

  /**
   * router.refresh やフィード切り替えで親から新しい投稿データが来たとき、
   * ローカルの楽観的状態をサーバー状態に同期する。
   */
  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [postId, initialLiked, initialLikeCount]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // 失敗時に戻せるよう、クリック前の状態を保持しておく。
    const previousLiked = liked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;
    const nextLikeCount = nextLiked
      ? previousLikeCount + 1
      : Math.max(0, previousLikeCount - 1);

    // 楽観的UI更新。ネットワーク完了を待たずにハート色と件数を変える。
    setLiked(nextLiked);
    setLikeCount(nextLikeCount);

    /**
     * DBへの保存は Server Action に任せる。
     *
     * UIはすでに上で更新済みなので、ここでは保存中フラグの管理と
     * 失敗時のロールバックだけを担当する。
     */
    startTransition(async () => {
      try {
        // 次の状態に合わせて、いいね作成または削除を実行する。
        if (nextLiked) {
          await likePostAction(postId);
        } else {
          await unlikePostAction(postId);
        }
      } catch (error) {
        console.error(error);

        // Server Action が失敗した場合は、クリック前の表示に戻す。
        setLiked(previousLiked);
        setLikeCount(previousLikeCount);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
      aria-pressed={liked}
      className={cn(
        "group flex items-center transition cursor-pointer disabled:opacity-60",
        liked ? "text-pink-500" : "text-white/50 hover:text-pink-500",
      )}
    >
      <span className="grid size-8 place-items-center rounded-full transition group-hover:bg-pink-500/10">
        <Heart
          className={cn("size-4", liked && "fill-current")}
          aria-hidden="true"
        />
      </span>
      <span>{likeCount}</span>
    </button>
  );
}
