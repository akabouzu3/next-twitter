// src/lib/upload/save-supabase-image.ts
import "server-only";

import { randomUUID } from "node:crypto";
import { getImageExtension } from "./image-extension";

type SaveSupabaseImageOptions = {
  directory: string;
};

/**
 * Supabase Storage へのアップロードに必要な環境変数を取得する。
 *
 * @throws SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定の場合
 */
function getSupabaseStorageConfig() {
  // Supabase URL は末尾スラッシュがあると Storage API のURL生成が崩れるため除去する。
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");

  // Storage upload はサーバー専用処理なので、service role key を使う。
  // このキーはRLSを迂回できるため、Client Componentやブラウザへ渡してはいけない。
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // bucket名は環境ごとに切り替えられるようにし、未設定時は本番想定の uploads を使う。
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required for image uploads.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for image uploads.");
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  };
}

/**
 * Supabase Storage に保存する object path を生成する。
 *
 * @param directory bucket 内の保存先ディレクトリ
 * @param extension 画像の拡張子
 * @returns `{directory}/{uuid}.{extension}` 形式の object path
 */
function createStoragePath(directory: string, extension: string) {
  // 呼び出し側が "/posts/" のように渡しても、Storage上では posts/{uuid}.ext に揃える。
  const normalizedDirectory = directory.replace(/^\/+|\/+$/g, "");

  // ファイル名はUUIDで生成し、同名アップロードによる衝突を避ける。
  return `${normalizedDirectory}/${randomUUID()}.${extension}`;
}

/**
 * 画像ファイルを Supabase Storage にアップロードし、公開URLを返す。
 *
 * @param file Server Action などから渡された画像ファイル
 * @param options 保存先ディレクトリなどのアップロード設定
 * @returns DBに保存してそのまま表示に使える Supabase Storage の公開URL
 * @throws 画像形式が未対応、環境変数が未設定、またはStorage uploadに失敗した場合
 */
export async function saveSupabaseImage(
  file: File,
  options: SaveSupabaseImageOptions,
): Promise<string> {
  // 許可する画像形式は getImageExtension 側で MIME type を元に判定する。
  const extension = getImageExtension(file);
  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseStorageConfig();
  const storagePath = createStoragePath(options.directory, extension);

  // SDKを追加せず、Supabase Storage REST APIへ直接アップロードする。
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": file.type,
        // UUIDの衝突はほぼ起きないが、万一同じpathになっても既存画像を上書きしない。
        "x-upsert": "false",
      },
      // Server Actionから渡された File を、fetch body に渡せる Buffer へ変換する。
      body: Buffer.from(await file.arrayBuffer()),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase Storage upload failed: ${message}`);
  }

  // bucket は public 前提なので、DBにはそのまま表示に使える公開URLを保存する。
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}
