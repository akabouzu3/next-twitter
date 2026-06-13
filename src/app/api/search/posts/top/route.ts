import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTopPostSearchPage } from "@/features/post/server/get-top-post-search-page";
import type { TopPostSearchCursor } from "@/features/post/types/post.types";

const cursorSchema = z
  .object({
    createdAt: z.string().datetime(),
    id: z.string().min(1),
    score: z.number().int().min(0),
  })
  .strict();

const searchParamsSchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

function parseCursor(rawCursor?: string): TopPostSearchCursor | null {
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
 * 話題タブの追加取得 API。
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

    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 },
      );
    }

    const page = await getTopPostSearchPage({
      query: q,
      limit,
      cursor,
    });

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/search/posts/top]", error);

    return NextResponse.json(
      {
        message: "話題のポスト検索結果の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
