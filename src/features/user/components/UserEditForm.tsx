"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { UserProfileItem } from "@/features/user/types/user.types";
import {
  updateUserAction,
  type UpdateUserActionState,
} from "@/features/user/actions/update-user-action";

type Props = {
  user: UserProfileItem;
};

const initialState: UpdateUserActionState = {
  success: false,
  message: "",
};

export function UserEditForm({ user }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateUserAction,
    initialState
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(
    user.image ?? null
  );

  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(user.backgroundImage ?? null);

  return (
    <form id="edit-form" action={formAction} className="flex flex-col">
      <input type="hidden" name="userId" value={user.id} />

      <div className="relative h-[120px] bg-neutral-900 sm:h-[200px]">
        {backgroundImagePreview ? (
          <Image
            src={backgroundImagePreview}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-neutral-800" />
        )}

        <input
          ref={backgroundImageInputRef}
          type="file"
          name="backgroundImage"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          disabled={isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setBackgroundImagePreview(URL.createObjectURL(file));
          }}
        />

        <button
          type="button"
          disabled={isPending}
          onClick={() => backgroundImageInputRef.current?.click()}
          className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/60 transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="ヘッダー画像を変更"
        >
          <Camera className="size-5" />
        </button>
      </div>

      <div className="px-4">
        <div className="relative h-16">
          <div className="absolute -top-10 left-0 rounded-full bg-black p-1">
            <div className="relative size-[88px] overflow-hidden rounded-full bg-neutral-800">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : null}

              <input
                ref={imageInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                disabled={isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setImagePreview(URL.createObjectURL(file));
                }}
              />

              <button
                type="button"
                disabled={isPending}
                onClick={() => imageInputRef.current?.click()}
                className="absolute inset-0 grid place-items-center bg-black/45 transition hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="プロフィール画像を変更"
              >
                <Camera className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-6">
          {state.message ? (
            <p
              className={
                state.success
                  ? "text-sm text-green-500"
                  : "text-sm text-red-500"
              }
            >
              {state.message}
            </p>
          ) : null}

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">名前</span>
            <input
              name="name"
              defaultValue={state.values?.name ?? user.name ?? ""}
              maxLength={50}
              disabled={isPending}
              className="mt-1 w-full bg-transparent text-[17px] outline-none disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.name ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">自己紹介</span>
            <textarea
              name="bio"
              defaultValue={state.values?.bio ?? user.bio ?? ""}
              maxLength={160}
              rows={3}
              disabled={isPending}
              className="mt-1 w-full resize-none bg-transparent text-[17px] outline-none disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.bio ? (
            <p className="text-sm text-red-500">{state.fieldErrors.bio[0]}</p>
          ) : null}

          {state.fieldErrors?.image ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.image[0]}
            </p>
          ) : null}

          {state.fieldErrors?.backgroundImage ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.backgroundImage[0]}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}