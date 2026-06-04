import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClassName = {
  sm: "size-5",
  md: "size-7",
  lg: "size-9",
} as const;

export default function LoadingSpinner({
  label = "読み込み中",
  size = "md",
  className,
}: Props) {
  return (
    <div role="status" aria-label={label} className={cn("text-white/60", className)}>
      <LoaderCircle
        className={cn("animate-spin", sizeClassName[size])}
        aria-hidden="true"
      />
    </div>
  );
}
