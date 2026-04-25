// Next.js App Router の API Route用
import { NextRequest, NextResponse } from "next/server";

// バリデーション用ライブラリ（型安全の要）
import { z } from "zod";

// 投稿取得ロジック（DBアクセス）
import { getUserPostsPageByUsername } from "@/features/post/server/get-user-posts-page";

/**
 * cursor の query string を復元するための schema
 *
 * フロントで:
 * encodeURIComponent(JSON.stringify(cursor))
 *
 * → APIでは:
 * decodeURIComponent → JSON.parse → zodで検証
 */
const cursorSchema = z.object({
  createdAt: z.string().datetime(), // ISO文字列として受ける
  id: z.string().min(1), // 空文字NG
});

/**
 * query string 全体の検証用 schema
 *
 * limit:
 * - stringで来るので coerce.number() で数値変換
 * - 最大50件に制限（DB負荷対策）
 *
 * cursor:
 * - 文字列として受け取る（あとでparseする）
 */
const searchParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10), // coerce.number()で強制的に数値変換
  cursor: z.string().optional(), // optional()で値がなくても成功するようにする（任意値）
});

/**
 * cursor を復元する関数
 *
 * 流れ：
 * 1. decodeURIComponent（URLエンコード解除）
 * 2. JSON.parse（文字列 → オブジェクト）
 * 3. zodで型チェック
 *
 * どこかで失敗したら null を返す（安全設計）
 */
function parseCursor(rawCursor?: string) {
  if (!rawCursor) return null;

  try {
    const decoded = decodeURIComponent(rawCursor); // URLデコード
    const parsed = JSON.parse(decoded); // JSON → object

    return cursorSchema.parse(parsed); // 型チェック（失敗するとthrow）
  } catch {
    return null; // 不正なcursorは無効扱い
  }
}

/**
 * 
 */
type Props = {
  params: {
    username: string;
  }
}

/**
 * GET /api/posts/timeline
 */
export async function GET(
  request: NextRequest,
  { params }: Props
 ) {
  try {

    const username = params?.username;

    /**
     * query string取得
     * URL: /api/posts/[username]?limit=10&cursor=xxx
     */
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;
    const rawCursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

    /**
     * 全体のバリデーション
     *
     * safeParse:
     * - 例外をthrowしない
     * - successで判定できる（API向き）
     */
    const result = searchParamsSchema.safeParse({
      limit: rawLimit,
      cursor: rawCursor,
    });

    // クエリが不正なら400
    if (!result.success) {
      return NextResponse.json(
        {
          message: "クエリパラメータが不正です",
          issues: result.error.flatten(), // フロントで使いやすい形式
        },
        { status: 400 },
      );
    }

    // バリデーション済みデータ
    const { limit, cursor: cursorParam } = result.data;

    // cursor復元
    const cursor = parseCursor(cursorParam);

    /**
     * cursorParamはあるのにparseできない = 不正なリクエスト
     * → 400を返す（セキュリティ的にも重要）
     */
    if (cursorParam && !cursor) {
      return NextResponse.json(
        {
          message: "cursor の形式が不正です",
        },
        { status: 400 },
      );
    }

    /**
     * DBからユーザ投稿を取得
     *
     * cursor:
     * - null → 初回ページ
     * - 値あり → 次ページ
     */
    const page = await getUserPostsPageByUsername({
      username,
      limit,
      cursor,
    });

    // 正常レスポンス
    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    /**
     * 想定外エラー（DBエラーなど）
     */
    console.error("[GET /api/posts/[username]]", error);

    return NextResponse.json(
      {
        message: "ユーザ投稿の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
