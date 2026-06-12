"use client";

import { useEffect, useRef, useState } from "react";
import { RecommendedUserItem } from "@/features/user/components/RecommendedUserItem";
import type { RecommendedUser } from "@/features/user/types/user.types";
// import type { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  // currentUser: CurrentUser | null;
  recommendUsers: RecommendedUser[];
};

export default function RightSidebar({ 
  // currentUser, 
  recommendUsers
 }: Props) {
  /**
   * =========================
   * refs
   * =========================
   */

  // 外側（stickyコンテナ）
  const outerRef = useRef<HTMLDivElement | null>(null);

  // 内側（実際に動かすコンテンツ）
  const innerRef = useRef<HTMLDivElement | null>(null);

  /**
   * =========================
   * state
   * =========================
   */

  /**
   * translateY(px)
   * → inner要素を上下に動かす値
   */
  const [translateY, setTranslateY] = useState(0);

  /**
   * =========================
   * effect
   * =========================
   */

  useEffect(() => {
    /**
     * 前回のスクロール位置
     *
     * deltaを計算するために使う
     */
    let lastScrollY = window.scrollY;

    /**
     * 要素の可動範囲を計算
     *
     * 「どこまで上下に動けるか」
     */
    const calcLimit = () => {
      const outer = outerRef.current;
      if (!outer) return 0;

      // 要素(inner)の高さ
      const contentHeight = outer.offsetHeight;
      // 画面サイズの高さ
      const viewportHeight = window.innerHeight;

      /**
       * 要素が画面より高い分だけ動かせる
       *
       * 例:
       * content = 1200px
       * viewport = 800px
       * → 400px分スクロール可能
       */
      return Math.max(contentHeight - viewportHeight, 0);
    };

    /**
     * スクロール時の処理
     */
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      /**
       * スクロール差分
       *
       * + → 下にスクロール（今回(130) - 前回(100) = 30）
       * - → 上にスクロール（今回(100) - 前回(130) = -30）
       */
      const delta = currentScrollY - lastScrollY;

      // 前回のスクロール位置を更新
      lastScrollY = currentScrollY;

      // 要素の稼働範囲を計算
      const limit = calcLimit();

      setTranslateY((prev) => {
        /**
         * 次の位置
         *
         * 下スクロール → 上に押し上げる（-方向）
         * 上スクロール → 下に戻す（+方向）
         */
        const next = prev - delta;

        /**
         * clamp処理（範囲制限）
         *
         * 0        = 上端
         * -limit   = 下端
         */
        if (next > 0) return 0;
        if (next < -limit) return -limit;

        return next;
      });
    };

    /**
     * リサイズ時の処理
     *
     * → viewport変化でlimitが変わるため補正
     */
    const handleResize = () => {
      const limit = calcLimit();

      setTranslateY((prev) => {
        if (prev < -limit) return -limit;
        if (prev > 0) return 0;
        return prev;
      });
    };

    // 初期計算
    handleResize();

    /**
     * イベント登録
     */
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    /**
     * ResizeObserver
     *
     * → サイドバーの高さが変わったときも再計算
     */
    const ro = new ResizeObserver(handleResize);

    if (innerRef.current) {
      ro.observe(innerRef.current);
    }

    /**
     * クリーンアップ
     */
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, []);

  /**
   * =========================
   * render
   * =========================
   */

  return (
    <div className="h-full min-h-dvh px-6">

      {/* =========================
          stickyコンテナ
      ========================= */}
      <div ref={outerRef} className="sticky top-0">
        {/* =========================
            検索バー（固定）
        ========================= */}
        <div className="sticky top-0 z-20 w-full bg-black py-2">
          <div className="rounded-full border border-white/10 px-4 py-3 text-gray-400">
            検索
          </div>
        </div>
        {/* =========================
            実際に動くコンテンツ
            → translateYで上下に移動
        ========================= */}
        <div
          ref={innerRef}
          className="flex flex-col gap-4 py-4 will-change-transform"
          style={{
            transform: `translateY(${translateY}px)`,
          }}
        >
          {/* =========================
              プレミアム
          ========================= */}
          {/* <section className="rounded-3xl border border-white/10 p-5">
            <h2 className="text-3xl font-extrabold leading-tight">
              プレミアムにサブスクライブ
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/90">
              広告を削除し、アナリティクスを確認し、返信をブーストし、
              さらに多くの機能を利用できます。
            </p>
            <button
              disabled
              className="
                mt-4 rounded-full bg-sky-500 px-5 py-2 font-bold
                cursor-pointer disabled:bg-gray-500 disabled:text-white/60
                disabled:cursor-default disabled:opacity-60
              "
            >
              購入する
            </button>
          </section> */}

          {/* =========================
              ニュース
          ========================= */}
          {/* <section className="rounded-3xl border border-white/10 p-5">
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
          </section> */}

          {/* =========================
              トレンド
          ========================= */}
          {/* <section className="rounded-3xl border border-white/10 p-5">
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
          </section> */}


          {/* =========================
              おすすめユーザー
          ========================= */}
          <section className="rounded-3xl border border-white/10 p-5">
            <h2 className="text-2xl font-extrabold">おすすめのユーザー</h2>

            <div className="mt-4 space-y-4">
              {recommendUsers.map((user) => (
                <RecommendedUserItem key={user.id} user={user} />
              ))}
            </div>

            {/* <Link href="/recommended_users" className="mt-2 flex w-full">
              <span className="text-blue-300/80">さらに表示</span>
            </Link> */}
          </section>
        </div>
      </div>
    </div>
  );
}
