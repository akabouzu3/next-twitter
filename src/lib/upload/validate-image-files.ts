// src/lib/upload/validate-image-files.ts
import "server-only";

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

type ValidateImageFilesOptions = {
  maxCount?: number;
  maxSize?: number;
  allowedTypes?: readonly string[];
};

type ValidateImageFilesResult =
  | { success: true }
  | {
      success: false;
      message: string;
      errors: string[];
    };

export function validateImageFiles(
  files: File[],
  options: ValidateImageFilesOptions = {}
): ValidateImageFilesResult {
  const {
    maxCount = 1,
    maxSize = 5 * 1024 * 1024,
    allowedTypes = DEFAULT_ALLOWED_IMAGE_TYPES,
  } = options;

  // 画像枚数が最大枚数を超えていたらエラー
  if (files.length > maxCount) {
    return {
      success: false,
      message: `画像は最大${maxCount}枚までです。`,
      errors: [`画像は最大${maxCount}枚までです。`],
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
        errors: [`各画像は${Math.floor(maxSize / 1024 / 1024)}MB以下にしてください。`],
      };
    }
  }

  return { success: true };
}