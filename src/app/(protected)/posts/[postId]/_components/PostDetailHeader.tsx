import BackButton from "@/components/back-button";

export default function PostDetailHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-white/10 bg-black/80 px-4 backdrop-blur">
      <BackButton />
      <h1 className="text-xl font-bold">ポスト</h1>
    </header>
  );
}
