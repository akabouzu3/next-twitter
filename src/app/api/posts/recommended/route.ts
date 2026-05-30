import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getRecommendedPostFeedPage } from "@/features/post/server/get-recommended-post-feed-page";

/**
 * cursor query を復元した後の shape。
 *
 * フロント側では JSON.stringify + encodeURIComponent して渡すため、
 * API側では decode + JSON.parse 後にこの schema で検証する。
 */
const cursorSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
});

/**
 * おすすめ投稿一覧 API の query schema。
 *
 * limit は DB 負荷を抑えるため最大50件に制限する。
 * cursor は初回取得では不要なので optional。
 */
const searchParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

/**
 * URL query の cursor を FeedPage 用 cursor に復元する。
 *
 * 不正な文字列・壊れたJSON・schema不一致は null として扱い、
 * 呼び出し側で 400 レスポンスに変換する。
 */
function parseCursor(rawCursor?: string) {
  if (!rawCursor) return null;

  try {
    const decoded = decodeURIComponent(rawCursor);
    const parsed = JSON.parse(decoded);

    return cursorSchema.parse(parsed);
  } catch {
    return null;
  }
}

/**
 * GET /api/posts/recommended
 *
 * おすすめ投稿フィードの追加ページを返す。
 * 初回ページは Server Component 側で取得し、この API は無限スクロール用に使う。
 */
export async function GET(request: NextRequest) {
  try {
    // URL: /api/posts/recommended?limit=10&cursor=...
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;
    const rawCursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

    // query string は外部入力なので、DBアクセス前に必ず検証する。
    const result = searchParamsSchema.safeParse({
      limit: rawLimit,
      cursor: rawCursor,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: "クエリパラメータが不正です",
          issues: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { limit, cursor: cursorParam } = result.data;
    const cursor = parseCursor(cursorParam);

    // cursor param があるのに復元できない場合は、不正なリクエストとして扱う。
    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 },
      );
    }

    const page = await getRecommendedPostFeedPage({
      limit,
      cursor,
    });

    // FeedPage shape をそのまま返す。
    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/posts/recommended]", error);

    return NextResponse.json(
      {
        message: "おすすめ投稿の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
