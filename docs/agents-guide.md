# AGENTS.md 解説

このドキュメントは、リポジトリ直下の `AGENTS.md` に書かれているルールの意図を説明するためのものです。

`AGENTS.md` は意図的に短く保っています。あれはプロジェクト全体の詳細なマニュアルではなく、Coding Agent が毎回読むためのコンパクトなルールブックです。背景説明や判断理由は、`AGENTS.md` に詰め込まず、このファイルに置きます。

## Stack

このセクションは、Agent がコードを編集するときに前提とすべき技術スタックを示しています。このプロジェクトでは、Next.js App Router、Server Components、Server Actions、Prisma、Auth.js、Tailwind CSS、shadcn/ui、Zod を前提にします。

目的は、Pages Router、client-first な data fetching、別のバリデーション方式など、このプロジェクトに合わない設計を持ち込まないようにすることです。

## Commands

このプロジェクトは `pnpm` を使います。`package.json` でも `pnpm@9.15.0` が指定されています。

Agent が使う基本コマンドは次のとおりです。

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

パッケージマネージャを統一することで、lockfile の不要な差分や依存解決の差異を避けられます。

## Protected Files

Protected Files は、うっかり編集したときの影響範囲が大きいファイルです。

例:

* `.env` にはローカルのシークレットが含まれる可能性があります。
* `prisma/migrations/**` はデータベースの履歴なので、気軽に書き換えるべきではありません。
* `pnpm-lock.yaml` と `package.json` は依存関係の解決に影響します。
* `next.config.*` と `src/lib/auth/auth.ts` はアプリ全体への影響が大きい設定ファイルです。

これらのファイルは永遠に編集禁止という意味ではありません。ユーザーがその種類の変更を明示的に依頼した場合は編集できます。

## Architecture

このアプリは server-first の設計を維持します。

* App Router only
* Server Components をデフォルトにする
* アプリ内の mutation では API routes より Server Actions を優先する
* Client Components は、インタラクションや browser API が必要な場合だけ使う

これにより、bundle size を抑えやすくなり、server-only なコードを守りやすくなり、現在の Next.js の設計にも沿いやすくなります。

## Data And Validation

Prisma はサーバー側に置きます。Client Components から Prisma や DB helper を import してはいけません。

サーバー専用モジュールでは、必要に応じて `server-only` を使います。

```ts
import "server-only";
```

Prisma の `select` object や mapper は再利用できる形にしておくと、feature 間で返却データの形を揃えやすくなります。feed では、同じ timestamp のレコードが複数ある場合でも順序が安定するように、cursor pagination で `createdAt` と `id` の両方を使います。

フォーム、API input、search params、Server Actions など、外部入力はシステムに入る境界で Zod によって検証します。

## UI

UI は既存の X/Twitter 風の方向性に合わせます。

* minimal な layout
* responsive な挙動
* dark mode に馴染む styling
* 控えめな border と hover state
* accessible な button、focus state、semantic HTML

独自 CSS や新しい component convention を追加する前に、既存の Tailwind と shadcn/ui の pattern を優先します。

## TypeScript And Code Style

Strict TypeScript を前提にします。Agent は `any` や広すぎる type assertion を避け、Prisma や Zod から得られる inferred type を活用します。

命名ルールは意図的にシンプルにしています。

* ファイル名は kebab-case
* component は PascalCase
* 変数と関数は camelCase

コメントは、明らかな処理内容ではなく「なぜその設計にしているのか」を説明するために使います。
