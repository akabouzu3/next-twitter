"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MapPin,
  ScanSearch,
  Smile,
  CalendarDays,
  X,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ImageUploadButton } from "@/features/post/components/ImageUploadButton";
import { CurrentUser } from "@/lib/auth/current-user";
import {
  createPostAction,
  type CreatePostActionState,
} from "@/features/post/actions/create-post-action";

import { cn } from "@/lib/utils";

type Props = {
  // 現在ログイン中のユーザー
  // 未ログインの場合は Composer 自体を表示しない
  currentUser: CurrentUser | null;

  // 投稿成功時に親コンポーネント側で実行したい処理
  // 例: ダイアログを閉じる、一覧を更新するなど
  onSuccess?: () => void;

  parentPostId?: string;
  placeholder?: string;
  submitLabel?: string;
  pendingLabel?: string;
  variant?: "post" | "reply";
};

/**
 * Server Action の初期状態
 *
 * useActionState は、
 * - 初回: initialState
 * - submit後: createPostAction の戻り値
 * を state として保持する
 */
const initialState: CreatePostActionState = {
  success: false,
  message: "",
};

// 投稿に添付できる画像の最大枚数
const MAX_IMAGE_COUNT = 4;

// 投稿本文の最大文字数
const MAX_POST_LENGTH = 280;

export default function PostComposer({
  currentUser,
  onSuccess,
  parentPostId,
  placeholder = "いまどうしてる？",
  submitLabel = "ポストする",
  pendingLabel = "投稿中...",
  variant = "post",
}: Props) {
  /**
   * Server Action とフォーム状態を紐づける
   *
   * state:
   *   createPostAction から返された結果
   *
   * formAction:
   *   form の action に渡す関数
   *
   * isPending:
   *   Server Action 実行中かどうか
   */
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState
  );

  /**
   * textarea の入力内容
   *
   * state.values?.content がある場合は、
   * バリデーションエラー後に入力内容を復元するために使う
   */
  const [content, setContent] = useState(state.values?.content || "");

  /**
   * 選択済み画像
   *
   * File[] を state で持つことで、
   * プレビュー表示・削除・送信時の制御を行う
   */
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  /**
   * textarea DOM を直接操作するための ref
   *
   * 入力内容に合わせて高さを自動調整するために使う
   */
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 残り文字数
  const remaining = MAX_POST_LENGTH - content.length;

  // 文字数オーバー判定
  const isOverLimit = remaining < 0;

  /**
   * 投稿ボタンの無効化条件
   *
   * - 送信中
   * - 文字数オーバー
   * - 本文も画像も空
   */
  const isDisabled =
    isPending ||
    isOverLimit ||
    (content.trim().length === 0 && selectedImages.length === 0);

  /**
   * 投稿成功時の処理
   *
   * state.success だけを見ると、
   * 連続投稿時に true → true のままで変化しない可能性がある。
   *
   * そのため submittedAt のような投稿ごとに変わる値を依存配列に入れると、
   * 投稿成功のたびに確実にリセット処理を実行できる。
   */
  useEffect(() => {
    if (!state.success || !state.submittedAt) return;

    // 本文をリセット
    setContent("");

    // 選択済み画像をリセット
    setSelectedImages([]);

    // textarea の見た目の高さも初期化
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }

    // 親側の成功処理を実行
    // 例: 投稿ダイアログを閉じる
    onSuccess?.();
  }, [state.submittedAt, state.success, onSuccess]);

  /**
   * 画像プレビュー用 URL を生成
   *
   * File オブジェクトはそのままだと next/image の src に使えないため、
   * URL.createObjectURL(file) で一時的な blob URL に変換する
   */
  const previewUrls = useMemo(() => {
    return selectedImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedImages]);

  /**
   * blob URL の解放処理
   *
   * URL.createObjectURL で作った URL は、
   * 不要になったら URL.revokeObjectURL で解放する。
   *
   * これをしないと、画像選択を繰り返したときに
   * ブラウザ上でメモリリークする可能性がある。
   */
  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  /**
   * バリデーションエラー後の本文復元
   *
   * Server Action 側でエラーになった場合、
   * state.values.content に直前の入力値を返しておくと、
   * フォームに再反映できる。
   */
  useEffect(() => {
    if (!textareaRef.current) return;

    setContent(state.values?.content ?? "");
    resizeTextarea(textareaRef.current);
  }, [state.values?.content]);

  /**
   * 画像追加処理
   *
   * - 既存画像と新しく選択した画像を結合
   * - 最大4枚までに制限
   */
  const handleSelectImages = (files: File[]) => {
    setSelectedImages((prev) => {
      const merged = [...prev, ...files];
      return merged.slice(0, MAX_IMAGE_COUNT);
    });
  };

  /**
   * 選択済み画像の削除処理
   *
   * targetIndex と一致しない画像だけ残す
   */
  const handleRemoveImage = (targetIndex: number) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== targetIndex)
    );
  };

  /**
   * textarea 入力時の処理
   *
   * - React state を更新
   * - 入力内容に合わせて textarea の高さを調整
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    setContent(value);
    resizeTextarea(e.currentTarget);
  };

  /**
   * 未ログイン時は投稿欄を表示しない
   */
  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full">
      {/* 
        form の action に formAction を渡すことで、
        submit 時に createPostAction が実行される
      */}
      <form action={formAction} className="flex min-h-0 flex-col">
        {parentPostId ? (
          <input type="hidden" name="parentPostId" value={parentPostId} />
        ) : null}
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
          {/* 投稿者アイコン */}
          <Link
            href={`/users/${currentUser.username}`}
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

          <div className="flex min-h-0 flex-1 flex-col">
            {/* 本文入力・画像プレビューエリア */}
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <textarea
                ref={textareaRef}
                name="content"
                placeholder={placeholder}
                value={content}
                disabled={isPending}
                onChange={handleChange}
                rows={1}
                className={cn(
                  "w-full resize-none overflow-y-auto bg-transparent text-white placeholder:text-white/35 outline-none disabled:opacity-70",
                  variant === "reply" ? "min-h-16 text-xl" : "min-h-28 text-2xl",
                )}
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
                          unoptimized
                        />
                      </div>

                      {/* 画像削除ボタン */}
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

              {/* 共通エラーメッセージ */}
              {!state.success && state.message ? (
                <p className="mt-2 text-sm text-red-500">{state.message}</p>
              ) : null}

              {/* 成功メッセージ */}
              {state.success && state.message ? (
                <p className="mt-2 text-sm text-emerald-500">
                  {state.message}
                </p>
              ) : null}

              {/* 本文のバリデーションエラー */}
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
            </div>

            {/* 下部アクションエリア */}
            <div className="mt-4 shrink-0 border-t border-zinc-800 px-2 pt-4">
              <div className="flex items-center justify-between gap-4">
                {/* 左側の投稿オプション */}
                <div className="flex flex-wrap items-center gap-4 text-sky-500">
                  <ImageUploadButton
                    isPending={isPending}
                    selectedImages={selectedImages}
                    onSelect={handleSelectImages}
                  />

                  <button type="button" className="cursor-pointer" disabled={isPending}>
                    <ScanSearch className="size-5" />
                  </button>

                  <button type="button" className="cursor-pointer" disabled={isPending}>
                    <Smile className="size-5" />
                  </button>

                  <button type="button" className="cursor-pointer" disabled={isPending}>
                    <CalendarDays className="size-5" />
                  </button>

                  <button type="button" className="cursor-pointer" disabled={isPending}>
                    <MapPin className="size-5" />
                  </button>
                </div>

                {/* 右側の文字数・投稿ボタン */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      isOverLimit ? "text-red-500" : "text-zinc-500"
                    )}
                  >
                    {remaining}
                  </span>

                  {/* PC / Tablet 用ボタン */}
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="hidden cursor-pointer rounded-full bg-white px-6 py-2 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50 md:inline-block"
                  >
                    {isPending ? pendingLabel : submitLabel}
                  </button>

                  {/* Mobile 用アイコンボタン */}
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className={cn(
                      "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black transition hover:bg-white/80 md:hidden",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <Send className="size-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * textarea の高さを入力内容に合わせて自動調整する関数
 *
 * 1. 一度 height を 0px にする
 * 2. scrollHeight を取得する
 * 3. その高さを textarea に反映する
 */
function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "0px";
  textarea.style.height = `${textarea.scrollHeight}px`;
}
