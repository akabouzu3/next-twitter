import "server-only";

import { prisma } from "@/lib/prisma/prisma";

type SendDirectMessageInput = {
  conversationId: string;
  currentUserId: string;
  content: string;
};

/**
 * DMを送信し、会話一覧の並び替え用時刻を同時に更新する。
 *
 * 参加者チェック、メッセージ作成、`lastMessageAt` 更新を transaction にまとめ、
 * 権限のない会話へ書き込まれたり一覧時刻だけずれたりしないようにする。
 */
export async function sendDirectMessage({
  conversationId,
  currentUserId,
  content,
}: SendDirectMessageInput) {
  return prisma.$transaction(async (tx) => {
    // 会話IDが存在しても、現在ユーザーが参加者でなければ送信できない。
    const participant = await tx.directConversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: {
        conversationId: true,
      },
    });

    if (!participant) {
      return null;
    }

    const message = await tx.directMessage.create({
      data: {
        conversationId,
        senderId: currentUserId,
        content,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // 一覧の順序は最後のメッセージ作成時刻で更新する。
    await tx.directConversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: message.createdAt,
      },
      select: {
        id: true,
      },
    });

    return message;
  });
}
