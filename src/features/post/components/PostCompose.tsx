"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  ImageIcon,
  MapPin,
  ScanSearch,
  Smile,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

export default function PostComposer({ currentUser }: Props) {
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (!currentUser) {
    return null;
  }

  return (
    <section className="hidden border-b border-white/10 px-4 py-3 md:block">
      <form ref={formRef} action={formAction}>
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
              maxLength={280}
              disabled={isPending}
              className="min-h-28 w-full resize-none bg-transparent text-3xl text-white placeholder:text-white/35 outline-none disabled:opacity-70"
            />

            {state.fieldErrors?.content?.[0] ? (
              <p className="mt-2 text-sm text-red-400">
                {state.fieldErrors.content[0]}
              </p>
            ) : null}

            {!state.success && state.message ? (
              <p className="mt-2 text-sm text-red-400">{state.message}</p>
            ) : null}

            {state.success && state.message ? (
              <p className="mt-2 text-sm text-emerald-400">{state.message}</p>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sky-500">
                <button type="button" className="cursor-pointer" disabled={isPending}>
                  <ImageIcon className="size-5" />
                </button>
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

              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-white px-6 py-2 font-bold text-black cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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