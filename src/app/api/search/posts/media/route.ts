import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMediaPostSearchPage } from "@/features/post/server/get-media-post-search-page";

/**
 * 投稿フィード共通の cursor wire format。
 *
 * クライアントでは `{ createdAt, id }` を JSON.stringify して URL エンコードする。
 * API 境界では decode -> JSON.parse -> Zod validation の順で復元する。
 */
const cursorSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
}).strict();

/**
 * メディア検索 API の query string schema。
 *
 * q は optional にしている。
 * 空検索では「最新のメディア付き投稿一覧」として動かすため。
 */
const searchParamsSchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

/**
 * URL query の cursor を FeedPage 用 cursor に復元する。
 *
 * 壊れた cursor は null を返し、GET handler 側で 400 として扱う。
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
 * メディアタブの追加取得 API。
 *
 * Server Component の初期表示は server 関数を直接呼び、
 * 無限スクロールの2ページ目以降だけこの API を使う。
 */
export async function GET(request: NextRequest) {
  try {
    const rawQuery = request.nextUrl.searchParams.get("q") ?? undefined;
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;
    const rawCursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

    const result = searchParamsSchema.safeParse({
      q: rawQuery,
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

    const { q = "", limit, cursor: cursorParam } = result.data;
    const cursor = parseCursor(cursorParam);

    // cursor param があるのに復元できない場合は、壊れたページング要求として扱う。
    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 },
      );
    }

    const page = await getMediaPostSearchPage({
      query: q,
      limit,
      cursor,
    });

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/search/posts/media]", error);

    return NextResponse.json(
      {
        message: "メディア検索結果の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
