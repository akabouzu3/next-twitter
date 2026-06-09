import { Search } from "lucide-react";
import BackButton from "@/components/back-button";
import { cn } from "@/lib/utils";

const tabs = [
  {
    title: "話題のポスト",
    isActive: false,
  },
  {
    title: "最新",
    isActive: false,
  },
  {
    title: "アカウント",
    isActive: true,
  },
  {
    title: "メディア",
    isActive: false,
  },
] as const;

type Props = {
  query: string;
};

function SearchTabs() {
  return (
    <nav className="border-t border-white/10">
      <div className="grid grid-cols-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <div
            key={tab.title}
            aria-disabled={!tab.isActive}
            className={cn(
              "relative flex h-12 min-w-[96px] items-center justify-center px-3 text-[15px] font-bold",
              tab.isActive
                ? "text-white"
                : "cursor-default text-neutral-500",
            )}
          >
            <span className="truncate">{tab.title}</span>

            {tab.isActive && (
              <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-sky-500" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

export default function SearchHeader({ query }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-3">
        <BackButton fallbackHref="/app" />

        <form action="/search" className="min-w-0 flex-1">
          <label className="relative block">
            <span className="sr-only">アカウントを検索</span>
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

      <SearchTabs />
    </header>
  );
}
