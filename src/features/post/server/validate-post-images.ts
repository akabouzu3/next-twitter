import "server-only";

const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

type ValidatePostImagesResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
      errors: string[];
    };

export function validatePostImages(
  images: File[]
): ValidatePostImagesResult {

  // 画像枚数が最大枚数を超えていたらエラー
  if (images.length > MAX_IMAGE_COUNT) {
    return {
      success: false,
      message: "画像は最大4枚までです。",
      errors: ["画像は最大4枚までです。"],
    };
  }

  // 画像形式が許可されていない場合はエラー
  for (const image of images) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return {
        success: false,
        message: "対応していない画像形式です。",
        errors: ["JPEG / PNG / WEBP / GIF のみアップロードできます。"],
      };
    }

    // 画像サイズが最大サイズを超えていたらエラー
    if (image.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        message: "画像サイズが大きすぎます。",
        errors: ["各画像は5MB以下にしてください。"],
      };
    }
  }

  // 正常な場合は成功
  return {
    success: true,
  };
}