import type {
  UserConnectionCursor,
  UserConnectionPage,
} from "@/features/user/types/user.types";

const PAGE_SIZE = 20;

function encodeCursor(cursor: UserConnectionCursor) {
  // cursor は createdAt と id の複合値なので、URL に載せられる文字列へ変換する。
  return encodeURIComponent(JSON.stringify(cursor));
}

type Input = {
  username: string;
  kind: "followers" | "following";
  cursor: UserConnectionCursor;
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchUserConnectionsPage({
  username,
  kind,
  cursor,
  limit = PAGE_SIZE,
  signal,
}: Input): Promise<UserConnectionPage> {
  // 追加取得では、取得件数と「前回ページの最後の位置」を query string で API に渡す。
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("cursor", encodeCursor(cursor));

  // フォロワー / フォロー中で API パスだけを切り替え、返却 shape は共通にする。
  const res = await fetch(`/api/users/${username}/${kind}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("ユーザー一覧の追加取得に失敗しました");
  }

  // API 側で UserConnectionPage に整形済みなので、UI はページ情報だけを扱えばよい。
  return (await res.json()) as UserConnectionPage;
}
