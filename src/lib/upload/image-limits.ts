/**
 * 画像アップロードの共通制約。
 *
 * フロント側と Server Action 側で同じ値を参照するために、`server-only`
 * ではない小さな定数モジュールにしている。Vercel 本番ではリクエスト本文が
 * 大きすぎると Server Action へ到達する前に 413 で弾かれるため、
 * ブラウザ側でも送信前に同じ上限で止める必要がある。
 *
 * Server Action 側の検証は、直接POST・改ざん・古いクライアントへの
 * 最終防衛として必ず残す。
 */
export const IMAGE_UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export const IMAGE_UPLOAD_ACCEPT = IMAGE_UPLOAD_ALLOWED_TYPES.join(",");

export const IMAGE_UPLOAD_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const IMAGE_UPLOAD_MAX_TOTAL_SIZE = 4 * 1024 * 1024;

/**
 * バイト数をユーザー向けのMB表記へ変換する。
 *
 * 上限値は整数MBで管理しているため、小数ではなく切り捨て表示にして
 * フロント/サーバーのエラーメッセージを揃える。
 */
export function formatImageUploadSize(size: number) {
  return `${Math.floor(size / 1024 / 1024)}MB`;
}
