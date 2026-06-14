import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserSearchPage } from "@/features/user/server/get-user-search-page";

/**
 * 追加取得用 cursor の wire format。
 *
 * User.username は unique なので、次ページの開始位置は username だけで特定できる。
 * `.strict()` にして旧形式や余分なキーを拒否し、API 境界で cursor shape を固定する。
 */
const cursorSchema = z.object({
  username: z.string().min(1),
}).strict();

/**
 * アカウント検索 API の query string schema。
 *
 * query string はすべて文字列として届くため、limit は Zod で number に変換する。
 * cursor は JSON を URL エンコードした文字列なので、ここでは文字列として受け取り、
 * `parseCursor` で復元と shape 検証を行う。
 */
const searchParamsSchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

/**
 * URL query の cursor を UserSearchCursor に復元する。
 *
 * クライアントでは `{ username }` を JSON.stringify して URL に載せるため、
 * API 側では decode -> JSON.parse -> Zod validation の順で境界チェックする。
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
 * アカウント検索結果の追加取得 API。
 *
 * Server Component の初期表示は `getUserSearchPage` を直接呼び、
 * 2ページ目以降の無限スクロールではこの API を使う。
 */
export async function GET(request: NextRequest) {
  try {
    // URLSearchParams#get は null を返すため、Zod の optional と合わせて undefined にそろえる。
    const rawQuery = request.nextUrl.searchParams.get("q") ?? undefined;
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;
    const rawCursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

    // 外部入力である query string は、DB アクセス前に必ず schema で検証する。
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

    const { q, limit, cursor: cursorParam } = result.data;
    const cursor = parseCursor(cursorParam);

    // cursor パラメータがあるのに復元できない場合は、壊れたページング要求として扱う。
    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 },
      );
    }

    // server 関数は初期表示と追加取得で共有し、API 側は入力検証と HTTP response に集中する。
    const page = await getUserSearchPage({
      query: q,
      limit,
      cursor,
    });

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("[GET /api/search/users]", error);

    return NextResponse.json(
      {
        message: "アカウント検索結果の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
