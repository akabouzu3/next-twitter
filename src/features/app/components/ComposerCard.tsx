"use client";

import { ImageIcon, MapPin, ScanSearch, Smile, CalendarDays } from "lucide-react";

export default function ComposerCard() {
  return (
    <section className="border-b border-white/10 px-4 py-3">
      <div className="flex gap-3">
        <div className="mt-1 size-10 shrink-0 rounded-full bg-zinc-700" />
        <div className="min-w-0 flex-1">
          <textarea
            placeholder="いまどうしてる？"
            className="min-h-28 w-full resize-none bg-transparent pt-2 text-3xl text-white placeholder:text-white/35 outline-none"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sky-500">
              <ImageIcon className="size-5" />
              <ScanSearch className="size-5" />
              <Smile className="size-5" />
              <CalendarDays className="size-5" />
              <MapPin className="size-5" />
            </div>

            <button className="rounded-full bg-white px-6 py-2 font-bold text-black disabled:opacity-50">
              ポストする
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}