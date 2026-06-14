/**
 * `/search` で tab query が省略されたときの表示。
 *
 * X/Twitter 風の検索画面に合わせ、先頭の「話題のポスト」を既定にする。
 */
export const DEFAULT_SEARCH_TAB = "top";

/**
 * 検索画面に表示するタブ定義。
 *
 * すべてのタブを URL で直接開けるようにしておき、
 * 未完成のタブは `SearchPage` 側で空状態を表示する。
 */
export const searchTabs = [
  {
    value: "top",
    label: "話題のポスト",
  },
  {
    value: "latest",
    label: "最新",
  },
  {
    value: "accounts",
    label: "アカウント",
  },
  {
    value: "media",
    label: "メディア",
  },
] as const;

export type SearchTab = (typeof searchTabs)[number]["value"];

/**
 * 外部入力の tab query が検索タブとして定義済みか判定する。
 */
export function isSearchTab(value: string): value is SearchTab {
  return searchTabs.some((tab) => tab.value === value);
}
