// src/lib/upload/save-local-image.ts
import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getImageExtension } from "./image-extension";

type SaveLocalImageOptions = {
  directory: string;
  publicPath: string;
};

export async function saveLocalImage(
  file: File,
  options: SaveLocalImageOptions
): Promise<string> {
  const extension = getImageExtension(file);

  /**
   * 保存先ディレクトリ
   *
   * process.cwd() = プロジェクトルート
   * → public/{options.directory} に保存
   */
  const uploadDir = path.join(process.cwd(), "public", options.directory);

  /**
   * ディレクトリが存在しない場合は作成
   * recursive: true → 親ディレクトリごと作る
   */
  await mkdir(uploadDir, { recursive: true });

  /**
   * ファイル名を一意にする
   * → 衝突防止（超重要）
   */
  const fileName = `${randomUUID()}.${extension}`;

  /**
   * 実際の保存パス
   */
  const filePath = path.join(uploadDir, fileName);

  /**
   * File → ArrayBuffer → Buffer に変換
   *
   * writeFile は Buffer を要求するため変換が必要
   */
  const arrayBuffer = await file.arrayBuffer(); // 画像の実データ（JS標準のバイナリデータ）
  const buffer = Buffer.from(arrayBuffer); // Node専用のバイナリデータに変換（fsはBufferを扱うため）

  /**
   * ファイルを書き込む
   */
  await writeFile(filePath, buffer);

  /**
   * クライアントからアクセスできるURLを生成し返却
   */
  return `${options.publicPath}/${fileName}`;
}