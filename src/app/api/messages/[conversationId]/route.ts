import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getDirectConversation } from "@/features/messages/server/get-direct-conversations";

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(_request: Request, { params }: Props) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "ログインが必要です。" },
      { status: 401 },
    );
  }

  const { conversationId } = await params;
  const conversation = await getDirectConversation({
    conversationId,
    currentUserId: currentUser.id,
  });

  if (!conversation) {
    return NextResponse.json(
      { message: "会話が見つかりません。" },
      { status: 404 },
    );
  }

  return NextResponse.json(conversation);
}
