import Image from "next/image";

import type { DirectMessageUser } from "@/features/messages/types/message.types";

type Props = {
  user: DirectMessageUser;
  size?: "sm" | "md";
};

export default function DirectUserAvatar({ user, size = "md" }: Props) {
  const sizeClass = size === "sm" ? "size-10" : "size-12";
  const textClass = size === "sm" ? "text-base" : "text-lg";

  return (
    <div
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-full bg-neutral-800`}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={`${user.name}のプロフィール画像`}
          fill
          className="object-cover"
          sizes={size === "sm" ? "40px" : "48px"}
        />
      ) : (
        <div
          className={`grid size-full place-items-center font-bold text-white ${textClass}`}
        >
          {user.name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
