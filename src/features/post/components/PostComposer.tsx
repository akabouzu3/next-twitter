"use client";

/**
 * React Hooks
 */
import { useActionState, useEffect, useMemo, useState } from "react";

/**
 * アイコン
 */
import {
  MapPin,
  ScanSearch,
  Smile,
  CalendarDays,
  X,
} from "lucide-react";

/**
 * Next.jsコンポーネント
 */
import Image from "next/image";
import Link from "next/link";

/**
 * 画像アップロードボタン（自作コンポーネント）
 */
import { ImageUploadButton } from "@/features/post/components/ImageUploadButton";

/**
 * 型・Server Action
 */
import { CurrentUser } from "@/lib/auth/current-user";
import {
  createPostAction,
  type CreatePostActionState,
} from "@/features/post/actions/create-post-action";

/**
 * Props定義
 */
type Props = {
  currentUser: CurrentUser | null;
};

/**
 * Server Actionの初期状態
 */
const initialState: CreatePostActionState = {
  success: false,
  message: "",
};

/**
 * 最大画像数（Twitter仕様）
 */
const MAX_IMAGE_COUNT = 4;

export default function PostComposer({ currentUser }: Props) {
  /**
   * Server Action連携
   *
   * - state: サーバーからの返却状態
   * - formAction: formのactionに渡す
   * - isPending: 実行中かどうか
   */
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState
  );

  /**
   * 選択中の画像（クライアント状態）
   */
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  /**
   * 投稿成功時に画像をリセット
   */
  useEffect(() => {
    if (state.success) {
      setSelectedImages([]);
    }
  }, [state.success]);

  /**
   * 画像プレビュー用URL生成
   *
   * File → blob URLに変換
   * URL.createObjectURL を使う
   */
  const previewUrls = useMemo(() => {
    return selectedImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedImages]);

  /**
   * メモリリーク防止
   *
   * createObjectURLで作ったURLは必ず解放する
   */
  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  /**
   * 画像追加処理
   *
   * - 既存 + 新規 をマージ
   * - 最大枚数制限
   */
  const handleSelectImages = (files: File[]) => {
    setSelectedImages((prev) => {
      const merged = [...prev, ...files];
      return merged.slice(0, MAX_IMAGE_COUNT);
    });
  };

  /**
   * 画像削除
   */
  const handleRemoveImage = (targetIndex: number) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== targetIndex)
    );
  };

  /**
   * 未ログイン時は表示しない
   */
  if (!currentUser) {
    return null;
  }

  return (
    <section className="hidden border-b border-white/10 px-4 py-3 md:block">
      {/* Server Actionを使ったフォーム */}
      <form action={formAction}>
        <div className="flex gap-3">

          {/* ユーザーアイコン */}
          <Link
            href={`/app/users/${currentUser.username}`}
            className="relative size-10 shrink-0 overflow-hidden rounded-full bg-zinc-700"
          >
            {currentUser.image ? (
              <Image
                src={currentUser.image}
                alt={currentUser.name ?? currentUser.username ?? "user"}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : null}
          </Link>

          <div className="min-w-0 flex-1">

            {/* 投稿テキスト */}
            <textarea
              name="content"
              placeholder="いまどうしてる？"
              defaultValue={state.values?.content ?? ""}
              maxLength={280}
              disabled={isPending}
              className="min-h-28 w-full resize-none bg-transparent text-3xl text-white placeholder:text-white/35 outline-none disabled:opacity-70"
            />

            {/* 画像プレビュー */}
            {previewUrls.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {previewUrls.map((item, index) => (
                  <div
                    key={`${item.file.name}-${index}`}
                    className="relative overflow-hidden rounded-2xl border border-white/10"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={item.url}
                        alt={`preview-${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized // blob URLなので最適化しない
                      />
                    </div>

                    {/* 削除ボタン */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isPending}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white disabled:opacity-50"
                      aria-label="画像を削除"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {/* エラーメッセージ */}
            {!state.success && state.message ? (
              <p className="mt-2 text-sm text-red-500">{state.message}</p>
            ) : null}

            {/* 成功メッセージ */}
            {state.success && state.message ? (
              <p className="mt-2 text-sm text-emerald-500">{state.message}</p>
            ) : null}

            {/* contentのバリデーションエラー */}
            {state.fieldErrors?.content?.map((error, index) => (
              <p key={`${error}-${index}`} className="text-sm text-red-500">
                {error}
              </p>
            ))}

            {/* 画像のバリデーションエラー */}
            {state.fieldErrors?.images?.map((error, index) => (
              <p key={`${error}-${index}`} className="text-sm text-red-500">
                {error}
              </p>
            ))}

            {/* 下部アクションエリア */}
            <div className="mt-4 flex items-center justify-between gap-4">

              {/* 左側（ツールボタン群） */}
              <div className="flex flex-wrap items-center gap-4 text-sky-500">

                {/* 画像アップロード */}
                <ImageUploadButton
                  isPending={isPending}
                  selectedImages={selectedImages}
                  onSelect={handleSelectImages}
                />

                <button
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <ScanSearch className="size-5" />
                </button>

                <button
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <Smile className="size-5" />
                </button>

                <button
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <CalendarDays className="size-5" />
                </button>

                <button
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <MapPin className="size-5" />
                </button>
              </div>

              {/* 投稿ボタン */}
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-full bg-white px-6 py-2 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "投稿中..." : "ポストする"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}