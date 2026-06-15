import {
  IMAGE_UPLOAD_ALLOWED_TYPES,
  IMAGE_UPLOAD_MAX_FILE_SIZE,
  IMAGE_UPLOAD_MAX_TOTAL_SIZE,
  formatImageUploadSize,
} from "@/lib/upload/image-limits";

type ValidateSelectedImageFilesOptions = {
  maxCount: number;
  maxSize?: number;
  maxTotalSize?: number;
};

/**
 * ブラウザで選択された画像を、フォーム送信前に検証する。
 *
 * これはUXだけのためではなく、本番の Vercel で
 * `FUNCTION_PAYLOAD_TOO_LARGE` を避けるための必須ガード。
 * ファイルが大きすぎる場合、Server Action のコードに到達する前に
 * Vercel が 413 を返すため、サーバー側の `validateImageFiles()` では
 * アプリ用のエラーメッセージを返せない。
 *
 * ただしフロント側検証は改ざんできるため、同じ制約を Server Action 側でも
 * 再検証する。ここでは送信前に止めることだけを担当し、空配列なら通過、
 * 1件以上なら表示用エラーとして扱う。
 */
export function validateSelectedImageFiles(
  files: File[],
  {
    maxCount,
    maxSize = IMAGE_UPLOAD_MAX_FILE_SIZE,
    maxTotalSize = IMAGE_UPLOAD_MAX_TOTAL_SIZE,
  }: ValidateSelectedImageFilesOptions,
) {
  // 選択直後に枚数・合計サイズ・形式・単体サイズを確認し、
  // 不正な File を input に残さないよう呼び出し元で空に戻す。
  if (files.length > maxCount) {
    return [`画像は最大${maxCount}枚までです。`];
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maxTotalSize) {
    return [
      `画像の合計サイズは${formatImageUploadSize(maxTotalSize)}以下にしてください。`,
    ];
  }

  for (const file of files) {
    if (!(IMAGE_UPLOAD_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return ["JPEG / PNG / WEBP / GIF のみアップロードできます。"];
    }

    if (file.size > maxSize) {
      return [`各画像は${formatImageUploadSize(maxSize)}以下にしてください。`];
    }
  }

  return [];
}
