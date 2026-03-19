export default function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="size-8 rounded-full bg-zinc-700" />
        <div className="text-3xl font-semibold">X</div>
        <button className="rounded-full border border-white/30 px-4 py-2 font-bold">
          購入する
        </button>
      </div>
    </header>
  );
}