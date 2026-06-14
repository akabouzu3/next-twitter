import Link from "next/link";

import DirectUserAvatar from "@/features/messages/components/DirectUserAvatar";
import type { DirectConversationListItem } from "@/features/messages/types/message.types";
import { formatRelativeTime } from "@/lib/utils/date";

type Props = {
  conversations: DirectConversationListItem[];
  currentUserId: string;
};

export default function DirectConversationList({
  conversations,
  currentUserId,
}: Props) {
  if (conversations.length === 0) {
    return (
      <div className="px-8 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-white">
          メッセージはまだありません
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-neutral-500">
          ユーザー名を入力するか、プロフィールから会話を始められます。
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col">
      {conversations.map((conversation) => {
        const lastMessage = conversation.lastMessage;
        const prefix =
          lastMessage?.senderId === currentUserId ? "あなた: " : "";

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="flex gap-3 border-b border-white/10 px-4 py-3 transition hover:bg-white/[0.03]"
          >
            <DirectUserAvatar user={conversation.otherUser} />

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-baseline gap-2">
                <p className="truncate text-[15px] font-bold leading-5 text-white">
                  {conversation.otherUser.name}
                </p>
                <p className="truncate text-[15px] leading-5 text-neutral-500">
                  @{conversation.otherUser.username}
                </p>
                <span className="shrink-0 text-sm text-neutral-500">
                  {formatRelativeTime(new Date(conversation.lastMessageAt))}
                </span>
              </div>

              <p className="mt-1 truncate text-[15px] leading-5 text-neutral-400">
                {lastMessage ? `${prefix}${lastMessage.content}` : "会話を開始しました"}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
