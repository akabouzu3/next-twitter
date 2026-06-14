"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma/prisma";
import { startDirectConversationSchema } from "@/features/messages/schemas/direct-message.schema";
import { startDirectConversation } from "@/features/messages/server/start-direct-conversation";

/**
 * DM開始フォームが返す状態。
 *
 * 成功時は会話詳細へ `redirect` するため、この state は主に失敗時の
 * 入力復元と field error 表示に使う。
 */
export type StartDirectConversationActionState = {
  success: boolean;
  message: string;
  values?: {
    username?: string;
  };
  fieldErrors?: {
    username?: string[];
  };
};

/**
 * username から1対1DMを開始する Server Action。
 *
 * 認証、入力検証、自分宛の拒否、送信先ユーザーの存在確認を行い、
 * 既存会話または新規会話の詳細ページへ遷移する。
 */
export async function startDirectConversationAction(
  _prevState: StartDirectConversationActionState,
  formData: FormData,
): Promise<StartDirectConversationActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }

  const rawUsername = String(formData.get("username") ?? "");
  const validatedFields = startDirectConversationSchema.safeParse({
    username: rawUsername,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      values: {
        username: rawUsername,
      },
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username } = validatedFields.data;

  // directKey では自分同士の会話も表現できてしまうため、Action 境界で明示的に拒否する。
  if (username === currentUser.username) {
    return {
      success: false,
      message: "自分自身にはメッセージを送れません。",
      values: {
        username: rawUsername,
      },
      fieldErrors: {
        username: ["自分自身にはメッセージを送れません。"],
      },
    };
  }

  // username は unique なので、送信先の存在確認は最小 select で十分。
  const targetUser = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      message: "ユーザーが見つかりません。",
      values: {
        username: rawUsername,
      },
      fieldErrors: {
        username: ["ユーザーが見つかりません。"],
      },
    };
  }

  const conversation = await startDirectConversation({
    currentUserId: currentUser.id,
    targetUserId: targetUser.id,
  });

  redirect(`/messages/${conversation.id}`);
}
