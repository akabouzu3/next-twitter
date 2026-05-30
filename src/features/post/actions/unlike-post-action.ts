"use server";

import { z } from "zod";

import { unlikePost } from "@/features/post/server/unlike-post";
import { requireCurrentUser } from "@/lib/auth/guards";

/**
 * Server Actionの入力境界。
 *
 * Client Componentから渡る値なので、DB処理へ渡す前に検証する。
 */
const postIdSchema = z.string().min(1);

/**
 * ログインユーザーが指定投稿のいいねを解除する。
 *
 * 認証チェックと入力検証を行い、実際のDB更新は server 層へ委譲する。
 */
export async function unlikePostAction(postId: string) {
  const parsedPostId = postIdSchema.parse(postId);
  const currentUser = await requireCurrentUser();

  await unlikePost({
    userId: currentUser.id,
    postId: parsedPostId,
  });
}
