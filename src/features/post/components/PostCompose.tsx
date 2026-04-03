"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  ScanSearch,
  Smile,
  CalendarDays,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ImageUploadButton } from "@/features/post/components/ImageUploadButton";
import { CurrentUser } from "@/lib/auth/current-user";
import {
  createPostAction,
  type CreatePostActionState,
} from "@/features/post/actions/create-post-action";

type Props = {
  currentUser: CurrentUser | null;
};

const initialState: CreatePostActionState = {
  success: false,
  message: "",
};

const MAX_IMAGE_COUNT = 4;

export default function PostComposer({ currentUser }: Props) {
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState
  );

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    if (state.success) {
      setSelectedImages([]);
    }
  }, [state.success]);

  const previewUrls = useMemo(() => {
    return selectedImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  const handleSelectImages = (files: File[]) => {
    setSelectedImages((prev) => {
      const merged = [...prev, ...files];
      return merged.slice(0, MAX_IMAGE_COUNT);
    });
  };

  const handleRemoveImage = (targetIndex: number) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== targetIndex)
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <section className="hidden border-b border-white/10 px-4 py-3 md:block">
      <form action={formAction}>
        <div className="flex gap-3">
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
            <textarea
              name="content"
              placeholder="いまどうしてる？"
              defaultValue={state.values?.content ?? ""}
              maxLength={280}
              disabled={isPending}
              className="min-h-28 w-full resize-none bg-transparent text-3xl text-white placeholder:text-white/35 outline-none disabled:opacity-70"
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

            {!state.success && state.message ? (
              <p className="mt-2 text-sm text-red-500">{state.message}</p>
            ) : null}

            {state.success && state.message ? (
              <p className="mt-2 text-sm text-emerald-500">{state.message}</p>
            ) : null}

            {state.fieldErrors?.content?.map((error, index) => (
              <p key={`${error}-${index}`} className="text-sm text-red-500">
                {error}
              </p>
            ))}

            {state.fieldErrors?.images?.map((error, index) => (
              <p key={`${error}-${index}`} className="text-sm text-red-500">
                {error}
              </p>
            ))}

            <div className="mt-4 flex items-center justify-between gap-4">
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