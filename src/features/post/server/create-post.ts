import "server-only";

/**
 * Node.js標準モジュール
 */
import { randomUUID } from "crypto"; // 一意なファイル名を生成する
import { mkdir, writeFile } from "fs/promises"; // ディレクトリ作成・ファイル書き込み
import path from "path"; // パス操作

import { prisma } from "@/lib/prisma/prisma";

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
 * 1. 画像をローカル(public/uploads/posts)に保存
 * 2. 画像URLを作成
 * 3. 投稿 + 画像をDBに保存
 */
export async function createPost({
  userId,
  content,
  images,
}: CreatePostInput) {
  /**
   * 保存した画像のURL一覧
   * DBに保存するために使う
   */
  const imageUrls: string[] = [];

  /**
   * 画像がある場合のみアップロード処理を行う
   */
  if (images.length > 0) {
    /**
     * 保存先ディレクトリ
     *
     * process.cwd() = プロジェクトルート
     * → public/uploads/posts に保存
     *
     * public配下なので
     * /uploads/posts/xxx.jpg でアクセス可能になる
     */
    const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");

    /**
     * ディレクトリが存在しない場合は作成
     * recursive: true → 親ディレクトリごと作る
     */
    await mkdir(uploadDir, { recursive: true });

    console.log("uploadDir", uploadDir);

    /**
     * 各画像を順番に処理
     */
    for (const image of images) {
      /**
       * File → ArrayBuffer → Buffer に変換
       *
       * writeFile は Buffer を要求するため変換が必要
       */
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      /**
       * 拡張子を取得
       * （ファイル名 or MIME typeから判定）
       */
      const extension = getExtension(image);

      /**
       * ファイル名を一意にする
       * → 衝突防止（超重要）
       */
      const fileName = `${randomUUID()}.${extension}`;

      /**
       * 実際の保存パス
       */
      const filePath = path.join(uploadDir, fileName);

      console.log("filePath", filePath);

      /**
       * ファイルを書き込む
       */
      await writeFile(filePath, buffer);

      /**
       * クライアントからアクセスできるURLを生成
       *
       * public配下なので `/uploads/...` でOK
       */
      imageUrls.push(`/uploads/posts/${fileName}`);
    }
  }

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
      content: true,
      createdAt: true,
      userId: true,
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

/**
 * ファイルから拡張子を取得する関数
 *
 * 優先順位：
 * 1. ファイル名の拡張子
 * 2. MIMEタイプ
 * 3. fallback（bin）
 */
function getExtension(file: File): string {
  const fileName = file.name.toLowerCase();

  /**
   * ファイル名ベースの判定
   */
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "jpg";
  if (fileName.endsWith(".png")) return "png";
  if (fileName.endsWith(".webp")) return "webp";
  if (fileName.endsWith(".gif")) return "gif";

  /**
   * MIMEタイプベースの判定
   */
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      /**
       * 不明な場合のfallback
       * → セキュリティ的にはここは弾く方が良い場合もある
       */
      return "bin";
  }
}