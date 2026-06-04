"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";

type Props = {
  fallbackHref?: string;
  ariaLabel?: string;
  className?: string;
};

export default function BackButton({
  fallbackHref = "/app",
  ariaLabel = "戻る",
  className,
}: Props) {
  const router = useRouter();

  const handleBack = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleBack}
      aria-label={ariaLabel}
      className={cn(
        "grid size-9 place-items-center rounded-full text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500",
        className,
      )}
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </Link>
  );
}
