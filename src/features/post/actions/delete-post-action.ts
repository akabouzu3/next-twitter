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
      parentPostId: true,
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

  await prisma.$transaction(async (tx) => {
    await tx.post.delete({
      where: {
        id: postId,
      },
    });

    if (post.parentPostId) {
      await tx.post.updateMany({
        where: {
          id: post.parentPostId,
          replyCount: {
            gt: 0,
          },
        },
        data: {
          replyCount: {
            decrement: 1,
          },
          engagementScore: {
            decrement: 2,
          },
        },
      });
    }
  });

  revalidatePath("/app");
  revalidatePath(`/users/${post.user.username}`);
  revalidatePath(`/users/${post.user.username}/with_replies`);
  revalidatePath(`/users/${post.user.username}/media`);
  revalidatePath(`/posts/${postId}`);
  if (post.parentPostId) {
    revalidatePath(`/posts/${post.parentPostId}`);
  }

  // /likes は「この投稿をいいねした全ユーザー」のページに影響するが、
  // 削除時に対象ユーザーを全件列挙して再検証すると重くなりやすいため、ここでは含めない。

  return {
    success: true,
    message: "投稿を削除しました。",
  };
}
