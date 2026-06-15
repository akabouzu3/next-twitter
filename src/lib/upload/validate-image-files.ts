// src/lib/upload/validate-image-files.ts
import "server-only";

import {
  IMAGE_UPLOAD_ALLOWED_TYPES,
  IMAGE_UPLOAD_MAX_FILE_SIZE,
  IMAGE_UPLOAD_MAX_TOTAL_SIZE,
  formatImageUploadSize,
} from "@/lib/upload/image-limits";

type ValidateImageFilesOptions = {
  maxCount?: number;
  maxSize?: number;
  maxTotalSize?: number;
  allowedTypes?: readonly string[];
};

type ValidateImageFilesResult =
  | { success: true }
  | {
      success: false;
      message: string;
      errors: string[];
    };

/**
 * Server Action に届いた画像ファイルを検証する。
 *
 * フロント側でも同じ制約で送信前に止めているが、ブラウザの検証は
 * 回避・改ざんできるため、サーバー側の検証は必須。ここはDB更新や
 * Storage保存の直前に置く最終防衛線として扱う。
 *
 * 注意: 本番の Vercel では、リクエスト本文が大きすぎるとこの関数が
 * 実行される前に 413 `FUNCTION_PAYLOAD_TOO_LARGE` になる。そのため、
 * 大きすぎる画像に対してアプリのエラー表示を返すには、クライアント側の
 * `validateSelectedImageFiles()` と併用する必要がある。
 */
export function validateImageFiles(
  files: File[],
  options: ValidateImageFilesOptions = {}
): ValidateImageFilesResult {
  const {
    maxCount = 1,
    maxSize = IMAGE_UPLOAD_MAX_FILE_SIZE,
    maxTotalSize = IMAGE_UPLOAD_MAX_TOTAL_SIZE,
    allowedTypes = IMAGE_UPLOAD_ALLOWED_TYPES,
  } = options;

  // 画像枚数が最大枚数を超えていたらエラー
  if (files.length > maxCount) {
    return {
      success: false,
      message: `画像は最大${maxCount}枚までです。`,
      errors: [`画像は最大${maxCount}枚までです。`],
    };
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maxTotalSize) {
    return {
      success: false,
      message: "画像サイズが大きすぎます。",
      errors: [
        `画像の合計サイズは${formatImageUploadSize(maxTotalSize)}以下にしてください。`,
      ],
    };
  }

  for (const file of files) {

    // 画像形式が許可されていない場合はエラー
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "対応していない画像形式です。",
        errors: ["JPEG / PNG / WEBP / GIF のみアップロードできます。"],
      };
    }

    // 画像サイズが最大サイズを超えていたらエラー
    if (file.size > maxSize) {
      return {
        success: false,
        message: "画像サイズが大きすぎます。",
        errors: [
          `各画像は${formatImageUploadSize(maxSize)}以下にしてください。`,
        ],
      };
    }
  }

  return { success: true };
}
