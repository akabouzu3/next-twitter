/**
 * DM UI で相手・送信者として表示する最小限のユーザー情報。
 *
 * Prisma の User payload をそのまま Client Component に渡さず、
 * 画面が必要とする公開情報だけに絞る。
 */
export type DirectMessageUser = {
  id: string;
  name: string;
  username: string;
  image: string | null;
};

/**
 * メッセージ一覧 `/messages` の1行に表示する会話情報。
 *
 * v1 は1対1DMのみなので、現在ユーザー以外の参加者を `otherUser` として扱う。
 */
export type DirectConversationListItem = {
  id: string;
  otherUser: DirectMessageUser;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  lastMessageAt: Date;
};

/**
 * 会話詳細に表示する1件のメッセージ。
 *
 * `isMine` は Client Component が現在ユーザーIDを持たずに
 * 吹き出しの左右を決められるよう、server mapper 側で確定する。
 */
export type DirectMessageItem = {
  id: string;
  content: string;
  createdAt: Date;
  isMine: boolean;
  sender: DirectMessageUser;
};

/**
 * 会話詳細 `/messages/[conversationId]` の表示に必要な情報。
 */
export type DirectConversationDetail = {
  id: string;
  otherUser: DirectMessageUser;
  messages: DirectMessageItem[];
};
