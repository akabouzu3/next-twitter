import LoadingSpinner from "@/components/loading-spinner";

export default function FeedListLoading() {
  return (
    <section
      aria-label="投稿を読み込み中"
      className="flex justify-center px-4 py-10"
    >
      <LoadingSpinner label="投稿を読み込み中" />
    </section>
  );
}
