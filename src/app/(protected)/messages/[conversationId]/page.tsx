import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DirectConversationView from "@/features/messages/components/DirectConversationView";
import { getDirectConversation } from "@/features/messages/server/get-direct-conversations";
import { requireAuth } from "@/lib/auth/page-guards";

export const metadata: Metadata = {
  title: "メッセージ",
};

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function DirectConversationPage({ params }: Props) {
  const currentUser = await requireAuth();
  const { conversationId } = await params;
  const conversation = await getDirectConversation({
    conversationId,
    currentUserId: currentUser.id,
  });

  if (!conversation) {
    notFound();
  }

  return <DirectConversationView initialConversation={conversation} />;
}
