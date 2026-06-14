import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { createDirectConversationKey } from "@/features/messages/server/direct-message-utils";

type StartDirectConversationInput = {
  currentUserId: string;
  targetUserId: string;
};

/**
 * 1対1DMを取得または作成する。
 *
 * `directKey` の unique 制約と `upsert` により、同じ2人の会話を
 * 何度開始しても単一の conversation に集約する。
 */
export async function startDirectConversation({
  currentUserId,
  targetUserId,
}: StartDirectConversationInput) {
  const directKey = createDirectConversationKey(currentUserId, targetUserId);

  return prisma.directConversation.upsert({
    where: {
      directKey,
    },
    create: {
      directKey,
      participants: {
        // 1対1DM v1 では作成時に必ず2人分の参加者を同時に作る。
        create: [
          {
            userId: currentUserId,
          },
          {
            userId: targetUserId,
          },
        ],
      },
    },
    update: {},
    select: {
      id: true,
    },
  });
}
