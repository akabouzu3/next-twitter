import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import {
  directConversationDetailSelect,
  directConversationListSelect,
} from "@/features/messages/server/selects";
import {
  toDirectConversationDetail,
  toDirectConversationListItem,
} from "@/features/messages/server/mappers";

/**
 * 現在ユーザーが参加している1対1DM一覧を取得する。
 *
 * 参加者条件を DB query に含めることで、他人の会話が mapper へ流れないようにする。
 */
export async function getDirectConversations(currentUserId: string) {
  const conversations = await prisma.directConversation.findMany({
    where: {
      participants: {
        some: {
          userId: currentUserId,
        },
      },
    },
    orderBy: [
      { lastMessageAt: "desc" },
      { id: "desc" },
    ],
    select: directConversationListSelect,
  });

  // v1 は1対1DM前提。想定外の片側参加者データは表示せず落とす。
  return conversations
    .map((conversation) =>
      toDirectConversationListItem({ conversation, currentUserId }),
    )
    .filter((conversation) => conversation !== null);
}

/**
 * 会話詳細を取得する。
 *
 * `conversationId` だけで取得せず、必ず `currentUserId` の参加者条件を含める。
 * これにより URL を知っているだけでは他人のDMを読めない。
 */
export async function getDirectConversation({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const conversation = await prisma.directConversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId: currentUserId,
        },
      },
    },
    select: directConversationDetailSelect,
  });

  if (!conversation) {
    return null;
  }

  return toDirectConversationDetail({ conversation, currentUserId });
}
