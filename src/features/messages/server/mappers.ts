import type {
  DirectConversationDetail,
  DirectConversationListItem,
} from "@/features/messages/types/message.types";
import type {
  DirectConversationDetailPayload,
  DirectConversationListPayload,
} from "@/features/messages/server/selects";

export function toDirectConversationListItem({
  conversation,
  currentUserId,
}: {
  conversation: DirectConversationListPayload;
  currentUserId: string;
}): DirectConversationListItem | null {
  const otherParticipant = conversation.participants.find(
    (participant) => participant.user.id !== currentUserId,
  );

  if (!otherParticipant) {
    return null;
  }

  const [lastMessage] = conversation.messages;

  return {
    id: conversation.id,
    otherUser: otherParticipant.user,
    lastMessage: lastMessage ?? null,
    lastMessageAt: conversation.lastMessageAt,
  };
}

export function toDirectConversationDetail({
  conversation,
  currentUserId,
}: {
  conversation: DirectConversationDetailPayload;
  currentUserId: string;
}): DirectConversationDetail | null {
  const otherParticipant = conversation.participants.find(
    (participant) => participant.user.id !== currentUserId,
  );

  if (!otherParticipant) {
    return null;
  }

  return {
    id: conversation.id,
    otherUser: otherParticipant.user,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      isMine: message.sender.id === currentUserId,
      sender: message.sender,
    })),
  };
}
