import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserRepliesPostFeedPageByUserId } from "@/features/post/server/get-user-replies-post-feed-page";
import { getUserByUsername } from "@/features/user/server/get-user";

const cursorSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
});

const searchParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

/**
 * URL クエリで受け取ったカーソル文字列を、フィード取得用の Cursor に変換する。
 *
 * クライアント側では JSON を URL エンコードして送るため、ここでデコードしてから
 * JSON として読み込み、Zod で `createdAt` と `id` の形式を検証する。
 *
 * @param rawCursor URL クエリの cursor 値。
 * @returns 有効なカーソル。未指定または不正な形式の場合は null。
 */
function parseCursor(rawCursor?: string) {
  if (!rawCursor) return null;

  try {
    return cursorSchema.parse(JSON.parse(decodeURIComponent(rawCursor)));
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{
    username: string;
  }>;
};

/**
 * 指定したユーザーの返信投稿フィードの追加ページを返す API route。
 *
 * `/api/posts/[username]/replies` に対して `limit` と `cursor` を受け取り、
 * username からユーザーを解決したうえで、返信投稿だけを JSON で返す。
 *
 * @param request Next.js のリクエスト。クエリパラメータからページング条件を読む。
 * @param params 返信投稿を取得する対象ユーザーの username。
 * @returns ユーザー返信フィードページ、またはバリデーション/サーバーエラーの JSON レスポンス。
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { username } = await params;
    // フィード取得側は userId を使うため、URL の username を先にユーザー情報へ解決する。
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        {
          message: "ユーザを取得できませんでした。",
        },
        { status: 400 },
      );
    }

    // URLSearchParams#get は null を返すため、Zod の optional と合わせて undefined にそろえる。
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;
    const rawCursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

    // limit の数値化と上限チェック、cursor の存在チェックを API 境界でまとめて行う。
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

    const page = await getUserRepliesPostFeedPageByUserId({
      userId: user.id,
      limit,
      cursor,
    });

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/posts/[username]/replies]", error);

    return NextResponse.json(
      {
        message: "ユーザ返信の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
