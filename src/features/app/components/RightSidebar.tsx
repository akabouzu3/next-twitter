"use client"
import { useRef , useState, useEffect } from "react";

export default function RightSidebar() {

  const ref = useRef<HTMLDivElement | null>(null);

  // sticky の top に渡すオフセット値（px）
  // → マイナス値を入れることで「下で止まる」挙動を作る
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    /**
     * 高さ差分を計算して topOffset を更新する関数
     */
    const calc = () => {
      const el = ref.current;
      if (!el) return; // DOMがまだ無い場合は何もしない

      // 要素の実際の高さ（コンテンツ含む）
      const elementHeight = el.offsetHeight;

      // 現在のビューポート（画面）の高さ
      const viewportHeight = window.innerHeight;
      console.log(elementHeight, viewportHeight);

      /**
       * 差分を計算
       * → この分だけ上にずらすことで
       *   「下端が画面にぴったり揃った位置」で止まる
       */
      const diff = Math.max(elementHeight - viewportHeight, 0);

      // sticky の top に負の値をセット
      setTopOffset(-diff);
    };

    // 初回マウント時に計算
    calc();

    /**
     * ResizeObserver
     *
     * 要素のサイズが変わったときに再計算する
     */
    const ro = new ResizeObserver(calc);

    if (ref.current) {
      ro.observe(ref.current); // refの要素を監視開始
    }

    /**
     * ウィンドウサイズ変更時（画面リサイズ）
     *
     * → viewportHeight が変わるので再計算が必要
     */
    window.addEventListener("resize", calc);

    // クリーンアップ
    return () => {
      ro.disconnect(); // ResizeObserverを停止
      window.removeEventListener("resize", calc); // イベント削除
    };
  }, []);

  return (
    <div className="h-full min-h-dvh px-6">
      <div className="sticky top-0 z-20 bg-black py-2">
        <div className="rounded-full border border-white/10 px-4 py-3 text-gray-400">
          検索
        </div>
      </div>

      <div ref={ref} className="sticky flex flex-col gap-4 py-4" style={{ top: `${topOffset}px` }}>
        <section className="rounded-3xl border border-white/10 p-5">
          <h2 className="text-3xl font-extrabold leading-tight">
            プレミアムにサブスクライブ
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/90">
            広告を削除し、アナリティクスを確認し、返信をブーストし、
            さらに多くの機能を利用できます。
          </p>
          <button 
            disabled={true}
            className="mt-4 rounded-full bg-sky-500 px-5 py-2 font-bold cursor-pointer 
              disabled:bg-gray-500 disabled:text-white/60 disabled:cursor-default disabled:opacity-60">
            購入する
          </button>
        </section>

        <section className="rounded-3xl border border-white/10 p-5">
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

        <section className="rounded-3xl border border-white/10 p-5">
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

    </div>
  );
}