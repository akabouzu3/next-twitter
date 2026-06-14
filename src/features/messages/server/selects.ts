import { Prisma } from "@prisma/client";

const directMessageUserSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
} satisfies Prisma.UserSelect;

export const directConversationListSelect = {
  id: true,
  lastMessageAt: true,
  participants: {
    select: {
      user: {
        select: directMessageUserSelect,
      },
    },
  },
  messages: {
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: 1,
    select: {
      content: true,
      senderId: true,
      createdAt: true,
    },
  },
} satisfies Prisma.DirectConversationSelect;

export const directConversationDetailSelect = {
  id: true,
  participants: {
    select: {
      user: {
        select: directMessageUserSelect,
      },
    },
  },
  messages: {
    orderBy: [
      { createdAt: "asc" },
      { id: "asc" },
    ],
    take: 100,
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: {
        select: directMessageUserSelect,
      },
    },
  },
} satisfies Prisma.DirectConversationSelect;

export type DirectConversationListPayload = Prisma.DirectConversationGetPayload<{
  select: typeof directConversationListSelect;
}>;

export type DirectConversationDetailPayload =
  Prisma.DirectConversationGetPayload<{
    select: typeof directConversationDetailSelect;
  }>;
