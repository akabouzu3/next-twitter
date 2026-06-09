import type { Metadata } from "next";
import { z } from "zod";
import SearchHeader from "@/app/(protected)/search/_components/SearchHeader";
import UserSearchList from "@/app/(protected)/search/_components/UserSearchList";
import { getRecommendedUsers } from "@/features/user/server/get-recommended-users";
import { getUserSearchPage } from "@/features/user/server/get-user-search-page";
import type {
  UserSearchItem,
  UserSearchPage,
} from "@/features/user/types/user.types";

export const metadata: Metadata = {
  title: "検索",
};

type Props = {
  /**
   * App Router の searchParams は URL query string 由来の外部入力。
   * `?q=a&q=b` のような重複指定では配列になるため、parse 時に代表値へ正規化する。
   */
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

/**
 * 検索語の URL query を UI / DB 検索に渡せる文字列へ整える。
 *
 * - 同名 query が複数ある場合は先頭だけを採用する
 * - 前後の空白を落とす
 * - 長すぎる入力は無効扱いにする
 */
const searchQuerySchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  },
  z.string().trim().max(100).optional(),
);

/**
 * 不正な検索語は空文字にフォールバックし、おすすめアカウント表示へ戻す。
 */
function parseSearchQuery(query: string | string[] | undefined) {
  const result = searchQuerySchema.safeParse(query);

  if (!result.success) {
    return "";
  }

  return result.data ?? "";
}

/**
 * おすすめアカウントを `UserSearchList` に渡せる静的な1ページ分の形へ変換する。
 *
 * おすすめ表示では追加取得をしないため、cursor は持たず `hasMore` も false 固定にする。
 */
function toSearchPage(items: UserSearchItem[]): UserSearchPage {
  return {
    items,
    nextCursor: null,
    hasMore: false,
  };
}

/**
 * アカウント検索ページ。
 *
 * `q` があるときは検索結果を初期ページとして取得し、
 * 空のときは同じ一覧 UI を使っておすすめアカウントを表示する。
 */
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = parseSearchQuery(q);
  const isSearching = query.length > 0;

  // 初期表示は Server Component で取得し、2ページ目以降だけ client fetch に任せる。
  const initialPage = isSearching
    ? await getUserSearchPage({
        query,
      })
    : toSearchPage(await getRecommendedUsers(20));

  return (
    <>
      <SearchHeader query={query} />

      {!isSearching && (
        <div className="px-4 py-3">
          <h1 className="text-xl font-extrabold leading-6 text-white">
            おすすめのアカウント
          </h1>
        </div>
      )}

      <UserSearchList
        initialPage={initialPage}
        query={query}
        emptyMessage={
          isSearching
            ? "一致するアカウントは見つかりませんでした。"
            : "おすすめできるアカウントはまだありません。"
        }
      />
    </>
  );
}
