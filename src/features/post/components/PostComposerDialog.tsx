"use client";

import * as React from "react";
import {
  ArrowLeft,
  CalendarDays,
  Globe,
  Image as ImageIcon,
  MapPin,
  Smile,
  X,
  BadgePlus,
  Flag,
  FileImage,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostComposer from "./PostComposer";
import { CurrentUser } from "@/lib/auth/current-user";

const MAX_POST_LENGTH = 280;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: CurrentUser;
  defaultValue?: string;
  isPending?: boolean;
  onSubmit?: (formData: FormData) => Promise<void> | void;
};

const toolbarItems = [
  { icon: ImageIcon, label: "画像を追加" },
  { icon: FileImage, label: "GIFを追加" },
  { icon: BadgePlus, label: "追加オプション" },
  { icon: Smile, label: "絵文字を追加" },
  { icon: CalendarDays, label: "予約投稿" },
  { icon: MapPin, label: "位置情報を追加" },
  { icon: Flag, label: "投票を追加" },
] as const;

export default function PostComposerDialog({
  open,
  onOpenChange,
  currentUser,
  defaultValue = "",
  isPending = false,
  onSubmit,
}: Props) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [content, setContent] = React.useState(defaultValue);
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    autoResize(textarea);
  }, [open]);

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const remaining = MAX_POST_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const isDisabled = isPending || content.trim().length === 0 || isOverLimit;

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setContent(value);
    autoResize(event.target);
  };

  const handlePickImages = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return files.slice(0, 4).map((file) => URL.createObjectURL(file));
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;

    const formData = new FormData(event.currentTarget);
    await onSubmit?.(formData);
  };

  const closeLabel = open ? "投稿ダイアログを閉じる" : "投稿ダイアログを開く";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden border-zinc-800 bg-black p-0 text-white shadow-2xl",
          "fixed inset-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:left-1/2 sm:top-12 sm:h-auto sm:max-h-[90dvh] sm:w-[min(600px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:translate-y-0 sm:rounded-2xl"
        )}
      >
        <DialogTitle className="sr-only">投稿を作成</DialogTitle>
        <DialogDescription className="sr-only">
          テキストや画像を入力して新しい投稿を作成します。
        </DialogDescription>

        <header className="flex h-14 shrink-0 items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                className="inline-flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:hidden"
              >
                <ArrowLeft className="size-5" />
              </button>

              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                className="hidden size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:inline-flex"
              >
                <X className="size-5" />
              </button>
            </div>

            <button
              type="button"
              className="text-[15px] font-bold text-sky-500 transition hover:opacity-80"
            >
              下書き
            </button>

            <Button
              type="submit"
              disabled={isDisabled}
              className={cn(
                "h-9 rounded-full px-4 text-[17px] font-bold text-black",
                "bg-white hover:bg-white/90 disabled:bg-sky-700/70 disabled:text-white/70",
                "sm:hidden"
              )}
            >
              ポストする
            </Button>
          </header>
        <PostComposer currentUser={currentUser}/>

        {/* <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                className="inline-flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:hidden"
              >
                <ArrowLeft className="size-5" />
              </button>

              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                className="hidden size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:inline-flex"
              >
                <X className="size-5" />
              </button>
            </div>

            <button
              type="button"
              className="text-[15px] font-bold text-sky-500 transition hover:opacity-80"
            >
              下書き
            </button>

            <Button
              type="submit"
              disabled={isDisabled}
              className={cn(
                "h-9 rounded-full px-4 text-[17px] font-bold text-black",
                "bg-white hover:bg-white/90 disabled:bg-sky-700/70 disabled:text-white/70",
                "sm:hidden"
              )}
            >
              ポストする
            </Button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 gap-3 px-3 pb-4 pt-3 sm:px-4">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.slice(0, 1)}</AvatarFallback>
              </Avatar>

              <div className="flex min-h-0 flex-1 flex-col">
                <textarea
                  ref={textareaRef}
                  name="content"
                  value={content}
                  onChange={handleTextareaChange}
                  placeholder="いまどうしてる？"
                  maxLength={MAX_POST_LENGTH + 40}
                  rows={1}
                  className="min-h-[140px] w-full resize-none border-none bg-transparent pt-1 text-[32px] leading-tight text-white outline-none placeholder:text-zinc-500 sm:min-h-[180px] sm:text-[36px]"
                />

                {previews.length > 0 ? (
                  <div className="mb-4 grid grid-cols-2 gap-2 overflow-hidden rounded-2xl border border-zinc-800">
                    {previews.map((url) => (
                      <div key={url} className="aspect-square overflow-hidden bg-zinc-950">
                        <img src={url} alt="選択した画像プレビュー" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto pb-3 text-sky-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[15px] font-bold hover:opacity-80"
                  >
                    <Globe className="size-4 fill-current" />
                    全員が返信できます
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 px-2 py-2 sm:px-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesChange}
                  />

                  {toolbarItems.map((item, index) => {
                    const Icon = item.icon;
                    const isImageButton = index === 0;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        aria-label={item.label}
                        title={item.label}
                        onClick={isImageButton ? handlePickImages : undefined}
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sky-500 transition hover:bg-sky-500/10 disabled:opacity-40"
                      >
                        <Icon className="size-5" />
                      </button>
                    );
                  })}
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      isOverLimit ? "text-red-500" : "text-zinc-500"
                    )}
                  >
                    {remaining}
                  </span>

                  <Button
                    type="submit"
                    disabled={isDisabled}
                    className="h-12 rounded-full px-6 text-[17px] font-bold text-black bg-white hover:bg-white/90 disabled:bg-zinc-700 disabled:text-zinc-400"
                  >
                    ポストする
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form> */}
      </DialogContent>
    </Dialog>
  );
}

function autoResize(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

