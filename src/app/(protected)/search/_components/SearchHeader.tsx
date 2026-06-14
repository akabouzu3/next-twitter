import Link from "next/link";
import { Search } from "lucide-react";
import BackButton from "@/components/back-button";
import NavigationPendingIndicator from "@/components/navigation-pending-indicator";
import {
  DEFAULT_SEARCH_TAB,
  searchTabs,
  type SearchTab,
} from "@/app/(protected)/search/_lib/search-tabs";
import { cn } from "@/lib/utils";

type Props = {
  query: string;
  activeTab: SearchTab;
};

/**
 * タブ切り替え用 href を作る。
 *
 * default tab は query string に出さず `/search` として扱う。
 * q はタブ移動後も同じ検索語を維持するために引き継ぐ。
 */
function createTabHref(tab: SearchTab, query: string) {
  const params = new URLSearchParams();

  if (tab !== DEFAULT_SEARCH_TAB) {
    params.set("tab", tab);
  }

  if (query) {
    params.set("q", query);
  }

  const search = params.toString();

  return search ? `/search?${search}` : "/search";
}

/**
 * 検索結果カテゴリのタブ。
 *
 * すべてのタブをリンクとして扱い、未完成のタブはページ側で空状態を表示する。
 */
function SearchTabs({
  activeTab,
  query,
}: {
  activeTab: SearchTab;
  query: string;
}) {
  return (
    <nav className="border-t border-white/10">
      <div className="grid grid-cols-4 overflow-x-auto scrollbar-hide">
        {searchTabs.map((tab) => {
          const isActive = tab.value === activeTab;
          const className = cn(
            "relative flex h-12 min-w-[96px] items-center justify-center px-3 text-[15px] font-bold",
            isActive ? "text-white" : "text-neutral-500",
            "transition hover:bg-white/5 hover:text-white",
          );
          const content = (
            <>
              <span className="truncate">{tab.label}</span>

              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-sky-500" />
              )}
            </>
          );

          return (
            <Link
              key={tab.value}
              href={createTabHref(tab.value, query)}
              className={className}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
              <NavigationPendingIndicator className="absolute right-2 top-1/2 -translate-y-1/2" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function SearchHeader({ query, activeTab }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-3">
        <BackButton fallbackHref="/app" />

        <form action="/search" className="min-w-0 flex-1">
          {/* 検索フォーム送信後も現在のタブを維持する。 */}
          {activeTab !== DEFAULT_SEARCH_TAB && (
            <input type="hidden" name="tab" value={activeTab} />
          )}
          <label className="relative block">
            <span className="sr-only">検索</span>
            <Search
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="検索"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-white/10 bg-black py-2 pl-12 pr-4 text-[15px] font-medium text-white outline-none placeholder:text-neutral-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </label>
        </form>
      </div>

      <SearchTabs activeTab={activeTab} query={query} />
    </header>
  );
}
