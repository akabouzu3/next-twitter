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
  Send
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
  currentUser: CurrentUser | null;
  onSuccess?: () => void;
};

const initialState: CreatePostActionState = {
  success: false,
  message: "",
};

const MAX_IMAGE_COUNT = 4;
// const TEXTAREA_MAX_HEIGHT = 300;
const MAX_POST_LENGTH = 280;

export default function PostComposer({ currentUser, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState
  );

  const [content, setContent] = useState(state.values?.content || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const remaining = MAX_POST_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const isDisabled = isPending || content.trim().length === 0 || isOverLimit;

  /**
   * 投稿成功時の処理
   */
  useEffect(() => {
    if (state.success) {
      // 選択している画像をリセット
      setSelectedImages([]);

      // テキストエリアをリセット
      if (textareaRef.current) {
        textareaRef.current.value = "";
        resizeTextarea(textareaRef.current);
      }
      
      // 成功時の処理（ダイアログを閉じるなど）
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

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

  useEffect(() => {
    if (!textareaRef.current) return;
    setContent(state.values?.content ?? "");
    resizeTextarea(textareaRef.current);
  }, [state.values?.content]);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setContent(value);
    resizeTextarea(e.currentTarget);
  };

  /**
   * 未ログイン時は表示しない
   */
  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full">
      <form action={formAction} className="flex min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
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

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <textarea
                ref={textareaRef}
                name="content"
                placeholder="いまどうしてる？"
                defaultValue={content}
                // maxLength={280}
                disabled={isPending}
                onChange={handleChange}
                rows={1}
                className="
                  min-h-28
                  w-full
                  resize-none
                  overflow-y-auto
                  bg-transparent
                  text-2xl
                  text-white
                  placeholder:text-white/35
                  outline-none
                  disabled:opacity-70
                "
                // style={{ maxHeight: `${TEXTAREA_MAX_HEIGHT}px` }}
              />

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
            </div>

            {/* 下部アクションエリア */}
            <div className="mt-4 shrink-0 border-t border-zinc-800 px-2 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sky-500">
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

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      isOverLimit ? "text-red-500" : "text-zinc-500"
                    )}
                  >
                    {remaining}
                  </span>
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="hidden md:inline-block cursor-pointer rounded-full bg-white px-6 py-2 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "投稿中..." : "ポストする"}
                  </button>
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className={cn("md:hidden flex h-12 w-12 items-center justify-center transition cursor-pointer rounded-full bg-white text-black hover:bg-white/80", 
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    <Send className="size-6"/>
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

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "0px";
  // テキストエリアの高さの上限を設定する場合はこれを有効にする
  // textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  textarea.style.height = textarea.scrollHeight + "px";
}