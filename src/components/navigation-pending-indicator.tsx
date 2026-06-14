"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export default function NavigationPendingIndicator({ className }: Props) {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <span
      role="status"
      aria-label="読み込み中"
      className={cn("pointer-events-none text-sky-400", className)}
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
    </span>
  );
}
