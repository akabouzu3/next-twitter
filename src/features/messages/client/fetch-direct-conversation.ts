import type { DirectConversationDetail } from "@/features/messages/types/message.types";

export async function fetchDirectConversation({
  conversationId,
  signal,
}: {
  conversationId: string;
  signal?: AbortSignal;
}): Promise<DirectConversationDetail> {
  const res = await fetch(`/api/messages/${conversationId}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("メッセージの取得に失敗しました");
  }

  return (await res.json()) as DirectConversationDetail;
}
