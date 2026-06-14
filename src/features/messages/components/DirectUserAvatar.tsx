import Image from "next/image";

import type { DirectMessageUser } from "@/features/messages/types/message.types";
import { getUserImageUrl } from "@/lib/utils/default-user-images";

type Props = {
  user: DirectMessageUser;
  size?: "sm" | "md";
};

export default function DirectUserAvatar({ user, size = "md" }: Props) {
  const sizeClass = size === "sm" ? "size-10" : "size-12";
  const userImageUrl = getUserImageUrl(user.image);

  return (
    <div
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-full bg-neutral-800`}
    >
      <Image
        src={userImageUrl}
        alt={`${user.name}のプロフィール画像`}
        fill
        className="object-cover"
        sizes={size === "sm" ? "40px" : "48px"}
      />
    </div>
  );
}
