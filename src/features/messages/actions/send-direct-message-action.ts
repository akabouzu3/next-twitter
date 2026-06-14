"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { sendDirectMessageSchema } from "@/features/messages/schemas/direct-message.schema";
import { sendDirectMessage } from "@/features/messages/server/send-direct-message";

/**
 * DM送信フォームが返す状態。
 *
 * `submittedAt` は同じ成功 state を Client Component 側で二重処理しないための
 * 送信ごとの識別子として使う。
 */
export type SendDirectMessageActionState = {
  success: boolean;
  message: string;
  submittedAt?: number;
  values?: {
    content?: string;
  };
  fieldErrors?: {
    conversationId?: string[];
    content?: string[];
  };
};

/**
 * 会話にメッセージを送信する Server Action。
 *
 * 会話への参加権限チェックは server 層の transaction 内で行い、
 * 成功時だけ一覧と詳細ページを再検証する。
 */
export async function sendDirectMessageAction(
  _prevState: SendDirectMessageActionState,
  formData: FormData,
): Promise<SendDirectMessageActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }

  const rawContent = String(formData.get("content") ?? "");
  const validatedFields = sendDirectMessageSchema.safeParse({
    conversationId: String(formData.get("conversationId") ?? ""),
    content: rawContent,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      values: {
        content: rawContent,
      },
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { conversationId, content } = validatedFields.data;

  // 戻り値が null の場合は、会話が存在しないか現在ユーザーが参加者ではない。
  const message = await sendDirectMessage({
    conversationId,
    currentUserId: currentUser.id,
    content,
  });

  if (!message) {
    return {
      success: false,
      message: "会話を取得できませんでした。",
      values: {
        content,
      },
      fieldErrors: {
        conversationId: ["会話を取得できませんでした。"],
      },
    };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);

  return {
    success: true,
    message: "送信しました。",
    submittedAt: Date.now(),
  };
}
