import type { Metadata } from "next";
import { z } from "zod";
import LatestPostSearchList from "@/app/(protected)/search/_components/LatestPostSearchList";
import MediaPostSearchList from "@/app/(protected)/search/_components/MediaPostSearchList";
import SearchEmptyState from "@/app/(protected)/search/_components/SearchEmptyState";
import SearchHeader from "@/app/(protected)/search/_components/SearchHeader";
import UserSearchList from "@/app/(protected)/search/_components/UserSearchList";
import {
  DEFAULT_SEARCH_TAB,
  isSearchTab,
  type SearchTab,
} from "@/app/(protected)/search/_lib/search-tabs";
import { getLatestPostSearchPage } from "@/features/post/server/get-latest-post-search-page";
import { getMediaPostSearchPage } from "@/features/post/server/get-media-post-search-page";
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
    tab?: string | string[];
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

const searchTabSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  },
  z.string().optional(),
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
 * URL query の tab を検索タブへ正規化する。
 *
 * 不明な値は default tab に戻し、既知のタブは空ページも含めてそのまま表示する。
 */
function parseSearchTab(tab: string | string[] | undefined): SearchTab {
  const result = searchTabSchema.safeParse(tab);

  if (!result.success || !result.data) {
    return DEFAULT_SEARCH_TAB;
  }

  if (!isSearchTab(result.data)) {
    return DEFAULT_SEARCH_TAB;
  }

  return result.data;
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
  const { q, tab } = await searchParams;
  const query = parseSearchQuery(q);
  const activeTab = parseSearchTab(tab);
  const isSearching = query.length > 0;

  if (activeTab === "top") {
    return (
      <>
        <SearchHeader query={query} activeTab={activeTab} />
        <SearchEmptyState
          title="話題のポスト"
          description="話題のポスト検索は準備中です。"
        />
      </>
    );
  }

  if (activeTab === "latest") {
    const initialPage = await getLatestPostSearchPage({
      query,
    });

    return (
      <>
        <SearchHeader query={query} activeTab={activeTab} />

        <LatestPostSearchList
          initialPage={initialPage}
          query={query}
          emptyMessage={
            isSearching
              ? "一致するポストは見つかりませんでした。"
              : "投稿はまだありません。"
          }
          endMessage={
            isSearching
              ? "検索結果は以上です"
              : "これ以上投稿はありません"
          }
        />
      </>
    );
  }

  /**
   * メディアタブ。
   *
   * query が空の場合も DB 取得し、最新のメディア付き投稿一覧として表示する。
   * 2ページ目以降は `MediaPostSearchList` から API route 経由で取得する。
   */
  if (activeTab === "media") {
    const initialPage = await getMediaPostSearchPage({
      query,
    });

    return (
      <>
        <SearchHeader query={query} activeTab={activeTab} />

        <MediaPostSearchList
          initialPage={initialPage}
          query={query}
          emptyMessage={
            isSearching
              ? "一致するメディア付き投稿は見つかりませんでした。"
              : "メディア付き投稿はまだありません。"
          }
          endMessage={
            isSearching
              ? "検索結果は以上です"
              : "これ以上メディア付き投稿はありません"
          }
        />
      </>
    );
  }

  // 初期表示は Server Component で取得し、2ページ目以降だけ client fetch に任せる。
  const initialPage = isSearching
    ? await getUserSearchPage({
        query,
      })
    : toSearchPage(await getRecommendedUsers(20));

  return (
    <>
      <SearchHeader query={query} activeTab={activeTab} />

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
