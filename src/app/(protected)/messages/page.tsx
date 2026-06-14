import type { Metadata } from "next";

import DirectConversationList from "@/features/messages/components/DirectConversationList";
import StartDirectConversationForm from "@/features/messages/components/StartDirectConversationForm";
import { getDirectConversations } from "@/features/messages/server/get-direct-conversations";
import { requireAuth } from "@/lib/auth/page-guards";

export const metadata: Metadata = {
  title: "メッセージ",
};

export default async function MessagesPage() {
  const currentUser = await requireAuth();
  const conversations = await getDirectConversations(currentUser.id);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-extrabold leading-6 text-white">
          メッセージ
        </h1>
      </header>

      <StartDirectConversationForm />
      <DirectConversationList
        conversations={conversations}
        currentUserId={currentUser.id}
      />
    </>
  );
}
