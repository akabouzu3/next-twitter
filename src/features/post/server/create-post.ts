import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { saveSupabaseImage } from "@/lib/upload/save-supabase-image";

/**
 * 投稿作成に必要な入力型
 */
type CreatePostInput = {
  userId: string;   // 投稿者ID
  content: string;  // 投稿本文
  images: File[];   // アップロードされた画像（Server Action経由）
};

/**
 * 投稿作成処理
 *
 * 流れ：
 * 1. 画像をSupabase Storageに保存
 * 2. 画像URLを作成
 * 3. 投稿 + 画像をDBに保存
 */
export async function createPost({
  userId,
  content,
  images,
}: CreatePostInput) {
  /**
   * Supabase Storageに画像を保存 + 保存した画像の公開URL一覧を取得する。
   * Vercelのファイルシステムは永続化されないため、本番では外部Storageに置く。
   */
  const imageUrls = await Promise.all(
    images.map((image) =>
      saveSupabaseImage(image, {
        directory: "posts",
      }),
    )
  );

  /**
   * Prismaで投稿を作成
   *
   * - 投稿本体
   * - 画像（リレーション）も同時に作成
   */
  const post = await prisma.post.create({
    data: {
      userId,
      content,
      images: {
        /**
         * imageUrlsを元に画像レコードを作成
         *
         * sortOrder:
         * → 表示順を保持するためのインデックス
         */
        create: imageUrls.map((imageUrl, index) => ({
          url: imageUrl,
          sortOrder: index,
        })),
      },
    },

    /**
     * 返却するデータを限定（パフォーマンス & セキュリティ）
     */
    select: {
      id: true,
      userId: true,
      content: true,
      createdAt: true,
      images: {
        /**
         * 画像は表示順で並び替え
         */
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return post;
}
