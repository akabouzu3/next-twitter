import type {
  UserSearchCursor,
  UserSearchPage,
} from "@/features/user/types/user.types";

const PAGE_SIZE = 20;

function encodeCursor(cursor: UserSearchCursor) {
  return encodeURIComponent(JSON.stringify(cursor));
}

type Input = {
  query: string;
  cursor: UserSearchCursor;
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchUserSearchPage({
  query,
  cursor,
  limit = PAGE_SIZE,
  signal,
}: Input): Promise<UserSearchPage> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", String(limit));
  params.set("cursor", encodeCursor(cursor));

  const res = await fetch(`/api/search/users?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("アカウント検索結果の追加取得に失敗しました");
  }

  return (await res.json()) as UserSearchPage;
}
