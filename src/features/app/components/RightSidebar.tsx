export default function RightSidebar() {
  return (
    <div className="h-dvh px-6 py-2">
      <div className="rounded-full border border-white/10 px-4 py-3 text-white/40">
        検索
      </div>

      <section className="mt-4 rounded-3xl border border-white/10 p-5">
        <h2 className="text-3xl font-extrabold leading-tight">
          プレミアムにサブスクライブ
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/90">
          広告を削除し、アナリティクスを確認し、返信をブーストし、
          さらに多くの機能を利用できます。
        </p>
        <button className="mt-4 rounded-full bg-sky-500 px-5 py-2 font-bold">
          購入する
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-white/10 p-5">
        <h2 className="text-2xl font-extrabold">本日のニュース</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-bold">生成AI関連の話題がトレンド</p>
            <p className="text-sm text-white/50">2日前・7,975件のポスト</p>
          </div>
          <div>
            <p className="font-bold">Claude CodeがXで話題</p>
            <p className="text-sm text-white/50">1日前・2,340件のポスト</p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-white/10 p-5">
        <h2 className="text-2xl font-extrabold">「いま」を見つけよう</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-white/50">スポーツ・トレンド</p>
            <p className="font-bold">ジッピーチューン</p>
          </div>
          <div>
            <p className="text-sm text-white/50">ライフスタイル・トレンド</p>
            <p className="font-bold">バレンタイン</p>
          </div>
        </div>
      </section>
    </div>
  );
}