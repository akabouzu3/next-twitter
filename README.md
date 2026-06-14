# Next Twitter

Next.js App Router と TypeScript で作成した Twitter/X ライクなSNSアプリです。

フロントエンドからバックエンドまで TypeScript で開発することを目的に、投稿、返信、いいね、フォロー、検索、プロフィール編集、画像アップロード、DM など、SNSに必要な機能実装を学習用として作成しました。

![home](design/pc-k.akabouzu.com_app.png)

## URL

- Service: https://k.akabouzu.com
- GitHub: https://github.com/akabouzu3/next-twitter

## 開発背景

個人でSNSサイトを作りたいという目標があり、まずは学習用として Twitter/X に近い機能を一つずつ実装しました。

Next.js App Router、Server Actions、Auth.js、Prisma を組み合わせ、画面実装だけでなく、認証、DB設計、サーバー処理、画像保存、無限スクロールまで一通り経験することを重視しています。

## 主な機能

- メールアドレス / パスワード認証、Googleログイン
- 投稿、返信、編集、削除、画像添付
- おすすめフィード、フォロー中タイムライン、無限スクロール
- いいね、フォロー / フォロー解除
- プロフィール表示、プロフィール編集
- ユーザー検索、投稿検索、メディア検索
- 1対1のダイレクトメッセージ
- PC / モバイル対応

## 工夫した点

### Node / pnpm のバージョン固定

チーム開発で環境差分が起きないように、`.nvmrc`、`packageManager`、`engines`、`.npmrc` を設定しました。

また、`preinstall` で独自スクリプトを実行し、Node.js のバージョン違いや pnpm 以外での install を検知して止めるようにしています。

### 無限スクロール

`IntersectionObserver` を使った無限スクロール用 hook を作成し、フィード、検索結果、プロフィール投稿一覧で再利用できるようにしました。

DB取得では `createdAt DESC, id DESC` の安定した並び順と cursor pagination を使い、OFFSET に頼らないページングを意識しています。

### createPortal を使ったモーダル

投稿、ログイン、サインアップなどのモーダルは `createPortal` で実装しました。

親要素の `overflow` や stacking context の影響を受けにくくし、モーダル表示のレイヤー管理を共通化しています。

### 開発しやすいディレクトリ構成

`src/features/post`、`src/features/user`、`src/features/messages` のように、機能単位で Server Actions、server logic、components、schemas、types を分けています。

関連するコードを同じ feature 配下にまとめることで、機能追加や修正をしやすくしました。

## 使用技術

| 分類 | 技術 |
| --- | --- |
| フロントエンド | TypeScript, React 19, Next.js 15 App Router |
| バックエンド | Server Actions, Route Handlers |
| 認証 | Auth.js v5, Google OAuth, bcryptjs |
| DB | PostgreSQL, Prisma |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI |
| バリデーション | Zod |
| 画像保存 | Local upload, Supabase Storage |
| インフラ | Docker, Vercel, Supabase |
| CI | GitHub Actions |

## ディレクトリ構成

```txt
src/
  app/                 # App Router pages, layouts, route handlers
  components/          # 共通 UI / layout components
  features/
    auth/              # 認証
    follow/            # フォロー
    messages/          # DM
    post/              # 投稿、フィード、検索
    user/              # プロフィール、ユーザー検索
  lib/
    auth/              # 認証ヘルパー
    prisma/            # Prisma client
    upload/            # 画像アップロード
prisma/
  schema.prisma        # DB schema
```

## セットアップ

### 前提

- Node.js 24
- pnpm 9.15.0
- PostgreSQL

### 1. 依存関係をインストール

```bash
corepack enable
pnpm install
```

### 2. 環境変数を用意

```bash
cp .env.example .env
```

ローカルDBを Docker Compose で起動する場合:

```bash
docker compose up -d
```

`.env` の例:

```env
APP_ENV=local
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/devdb?schema=public"
DIRECT_URL="postgresql://devuser:devpass@localhost:5432/devdb?schema=public"
AUTH_SECRET="your-secret"
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_ORIGIN="http://localhost:3000"
APP_ORIGIN="http://localhost:3000"
IMAGE_STORAGE_DRIVER=local
```

### 3. Prisma Client を生成

```bash
pnpm exec prisma generate
```

DB schema をローカルDBへ反映する場合:

```bash
pnpm exec prisma migrate dev
```

### 4. 開発サーバーを起動

```bash
pnpm dev
```

http://localhost:3000 で確認できます。

## 開発コマンド

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```
