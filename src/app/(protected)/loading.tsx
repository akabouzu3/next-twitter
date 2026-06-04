import LoadingSpinner from "@/components/loading-spinner";

export default function Loading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-black">
      <LoadingSpinner size="lg" />
    </main>
  );
}
