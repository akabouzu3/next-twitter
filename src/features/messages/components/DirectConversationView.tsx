"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import DirectMessageForm from "@/features/messages/components/DirectMessageForm";
import DirectUserAvatar from "@/features/messages/components/DirectUserAvatar";
import { fetchDirectConversation } from "@/features/messages/client/fetch-direct-conversation";
import type { DirectConversationDetail } from "@/features/messages/types/message.types";
import BackButton from "@/components/back-button";

const POLLING_INTERVAL_MS = 5000;

type Props = {
  initialConversation: DirectConversationDetail;
};

/**
 * DM詳細画面のクライアント表示。
 *
 * 初期表示は Server Component で権限確認済みのデータを受け取り、
 * 以降は5秒ごとに同じ会話APIを読んで新着を反映する。
 */
export default function DirectConversationView({
  initialConversation,
}: Props) {
  const [conversation, setConversation] = useState(initialConversation);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 会話IDが変わって新しい初期データが渡されたら、表示中の会話も差し替える。
    setConversation(initialConversation);
  }, [initialConversation]);

  useEffect(() => {
    const controller = new AbortController();

    // WebSocket等は使わず、v1 は軽量なポーリングで新着メッセージを反映する。
    const intervalId = window.setInterval(async () => {
      try {
        const nextConversation = await fetchDirectConversation({
          conversationId: initialConversation.id,
          signal: controller.signal,
        });
        setConversation(nextConversation);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to poll direct messages", error);
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      // 画面遷移時に進行中の取得と定期実行を止め、古い会話の更新が残らないようにする。
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [initialConversation.id]);

  useEffect(() => {
    // 自分の送信やポーリングで新着が増えたら、最新メッセージへ寄せる。
    // DOMの高さが反映された次の描画タイミングで動かすと、下まで届きやすい。
    const animationFrameId = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: "end" });
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [conversation.messages.length]);

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white md:min-h-screen">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-black/80 px-4 backdrop-blur">
        <BackButton fallbackHref="/messages" />

        <Link
          href={`/users/${conversation.otherUser.username}`}
          className="flex min-w-0 items-center gap-3"
        >
          <DirectUserAvatar user={conversation.otherUser} size="sm" />
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-bold leading-5 text-white">
              {conversation.otherUser.name}
            </h1>
            <p className="truncate text-sm leading-5 text-neutral-500">
              @{conversation.otherUser.username}
            </p>
          </div>
        </Link>
      </header>

      <div className="flex-1 px-4 py-4 pb-24 md:pb-4">
        {conversation.messages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-2xl font-extrabold text-white">
              会話を始めましょう
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-neutral-500">
              最初のメッセージを送信できます。
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.isMine
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.isMine
                      ? "max-w-[78%] rounded-3xl bg-sky-500 px-4 py-2 text-[15px] leading-5 text-white"
                      : "max-w-[78%] rounded-3xl bg-neutral-800 px-4 py-2 text-[15px] leading-5 text-white"
                  }
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {/* stickyの送信フォームに最新メッセージが隠れないよう、末尾に余白を置く。 */}
            <div ref={bottomRef} className="h-24 md:h-20" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-20 pb-16 md:pb-0">
        <DirectMessageForm conversationId={conversation.id} />
      </div>
    </div>
  );
}
