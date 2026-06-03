"use server";

import { revalidatePath } from "next/cache";

import { assertCanDeletePost, requireCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/prisma";

export async function deletePostAction(postId: string) {
  const currentUser = await requireCurrentUser();

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      userId: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!post) {
    return {
      success: false,
      message: "投稿が見つかりません。",
    };
  }

  assertCanDeletePost(currentUser, post);

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  revalidatePath("/app");
  revalidatePath(`/users/${post.user.username}`);
  revalidatePath(`/users/${post.user.username}/media`);
  revalidatePath(`/posts/${postId}`);

  // /likes は「この投稿をいいねした全ユーザー」のページに影響するが、
  // 削除時に対象ユーザーを全件列挙して再検証すると重くなりやすいため、ここでは含めない。

  return {
    success: true,
    message: "投稿を削除しました。",
  };
}
