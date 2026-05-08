// src/lib/upload/image-extension.ts
import "server-only";

/**
 * ファイルから拡張子を取得する関数
 *
 * 優先順位：
 * 1. ファイル名の拡張子
 * 2. MIMEタイプ
 */
export function getImageExtension(file: File): string {
  // const fileName = file.name.toLowerCase();

  // /**
  //  * ファイル名ベースの判定
  //  */
  // if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "jpg";
  // if (fileName.endsWith(".png")) return "png";
  // if (fileName.endsWith(".webp")) return "webp";
  // if (fileName.endsWith(".gif")) return "gif";

  /**
   * MIMEタイプベースの判定（こちらで判断する）
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
      throw new Error("対応していない画像形式です。");
  }
}