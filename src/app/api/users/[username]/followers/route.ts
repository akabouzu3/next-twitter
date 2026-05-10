import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserConnectionsPage } from "@/features/user/server/get-user-connections-page";

const cursorSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
});

const searchParamsSchema = z.object({
  // 1回の追加取得で返す件数。大きすぎる値は API 側で制限する。
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

function parseCursor(rawCursor?: string) {
  if (!rawCursor) return null;

  try {
    // クライアントでは JSON を URL エンコードして渡すため、ここで元の cursor に戻す。
    const decoded = decodeURIComponent(rawCursor);
    const parsed = JSON.parse(decoded);

    // cursor pagination に必要な createdAt + id の形だけを受け付ける。
    return cursorSchema.parse(parsed);
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { username } = await params;

    // URLSearchParams から取り出した値を Zod に通し、境界で入力を正規化する。
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
        { status: 400 },
      );
    }

    const { limit, cursor: cursorParam } = result.data;
    const cursor = parseCursor(cursorParam);

    // cursor が指定されているのに復元できない場合は、壊れたページング要求として扱う。
    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 },
      );
    }

    // followers API では、指定ユーザーをフォローしているユーザー一覧を取得する。
    const page = await getUserConnectionsPage({
      username,
      kind: "followers",
      limit,
      cursor,
    });

    if (!page) {
      return NextResponse.json(
        {
          message: "ユーザーが見つかりません",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/users/[username]/followers]", error);

    return NextResponse.json(
      {
        message: "フォロワー一覧の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
