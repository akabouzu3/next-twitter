import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTimelinePage } from "@/features/post/server/get-timeline-page";

/**
 * cursor の query string を復元するための schema
 *
 * 例:
 * cursor=%7B%22createdAt%22%3A%222026-04-18T00%3A00%3A00.000Z%22%2C%22id%22%3A%22abc123%22%7D
 */
const cursorSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
});

/**
 * query string 全体の検証用 schema
 */
const searchParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

/**
 * cursor 文字列を decode → JSON.parse → zod validate する
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

export async function GET(request: NextRequest) {
  try {
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;
    const rawCursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

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
        { status: 400 }
      );
    }

    const { limit, cursor: cursorParam } = result.data;
    const cursor = parseCursor(cursorParam);

    /**
     * cursorParam があるのに parse に失敗した場合は 400
     */
    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 }
      );
    }

    const page = await getTimelinePage({
      limit,
      cursor,
    });

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/posts/timeline]", error);

    return NextResponse.json(
      {
        message: "タイムラインの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}