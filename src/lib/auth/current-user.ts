import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma/prisma";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";

export const currentUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  image: true,
  backgroundImage: true,
  _count: {
    select: {
      following: true,
      followers: true,
    },
  },
});

export type CurrentUser = Prisma.UserGetPayload<{
  select: typeof currentUserSelect;
}>;
/**
 * DBから現在ユーザーの詳細を取得する
 * - session.user.id を使う
 * - 未ログイン / DBにユーザーがいない場合は null
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: currentUserSelect,
  });

  if (!user) {
    return null;
  }

  return user;
});
