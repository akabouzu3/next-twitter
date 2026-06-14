# Next Twitter

Twitter/X ライクな SNS を Next.js App Router で実装したポートフォリオアプリです。投稿、返信、いいね、フォロー、検索、プロフィール編集、画像アップロード、1対1のダイレクトメッセージまで、SNS の基本体験をフルスタックで構築しています。


## サービス概要

Next Twitter は、「Twitter/X のようなタイムライン体験を、Next.js と TypeScript で作る」ことをテーマにした個人開発アプリです。

Next.js を使用し、フロントエンドもバックエンドも TypeScript で開発することを目的に制作しました。単なる画面模写ではなく、認証、DB設計、Server Actions、cursor pagination、画像保存、検索、DM まで含め、実サービスに近いデータの流れとユーザー操作を意識して実装しています。

### URL

- GitHub: https://github.com/akabouzu3/next-twitter
- Service: https://k.akabouzu.com

## 開発背景

個人でSNSサイトを作りたいという目標があり、その学習用として、SNSに必要な機能実装を一つずつ練習するために制作しました。

特に、Next.js App Router、Auth.js v5、Prisma、Server Actions を組み合わせ、フロントエンドからサーバー処理、DBアクセスまで TypeScript で一貫して書く実践的なフルスタック開発を学ぶことを重視しました。

Twitter/X は、投稿、返信、いいね、フォロー、検索、DM など複数ドメインが自然に絡み合うため、認証済みアプリの設計力、DBクエリ設計、UIの状態管理、レスポンシブ対応をまとめて鍛えられる題材だと考えました。

## 工夫した点

### チーム開発を想定した Node / pnpm のバージョン固定

チーム開発で Node.js や pnpm のバージョン差分が起きにくいように、`.nvmrc`、`packageManager`、`engines`、`.npmrc` の `engine-strict=true` を設定しています。

さらに `preinstall` で独自のガードスクリプトを実行し、Node.js のメジャーバージョン違いや pnpm 以外での install を検知して止める仕組みにしました。

### 開発しやすい feature-based なディレクトリ構成

`src/features/post`、`src/features/user`、`src/features/messages` のように、ドメイン単位で Server Actions、server logic、components、schemas、types を分離しています。機能追加時に関連コードを追いやすくすることを重視しました。

### 無限スクロールと cursor pagination

フィード、検索、プロフィール投稿一覧、フォロー一覧、DM 一覧では、`createdAt DESC, id DESC` などの安定した順序を使っています。Prisma の複合 cursor と DB index を組み合わせ、OFFSET に頼らないページングを意識しました。

クライアント側では `IntersectionObserver` を使った無限スクロール用 hook を作成し、フィードや検索結果、プロフィール投稿一覧で再利用できるようにしました。

### createPortal を使ったモーダル表示

投稿ダイアログやログイン / サインアップダイアログなど、画面上に重ねて表示するUIは `createPortal` を使って実装しました。親要素の stacking context や overflow の影響を受けにくくし、レイヤー管理を共通化しています。


### 画像保存先の切り替え

ローカル開発では `public/uploads`、本番では Supabase Storage に切り替えられるよう、画像保存処理を driver として分離しています。


## メイン機能の使い方

| 機能 | 操作 |
| --- | --- |
| 投稿 | ホーム画面または投稿ダイアログから本文と画像を入力して投稿します。 |
| 返信 | 投稿詳細画面から親投稿に対して返信を作成します。 |
| いいね | 投稿下部のいいねボタンで追加 / 解除します。 |
| フォロー | ユーザープロフィールやユーザー一覧からフォロー / 解除します。 |
| 検索 | キーワードを入力して、ユーザー、話題の投稿、最新投稿、メディアを切り替えて探します。 |
| DM | メッセージ画面からユーザーを指定して1対1の会話を開始し、メッセージを送信します。 |

## 使用技術一覧

| 分類 | 技術 |
| --- | --- |
| フロントエンド | TypeScript, React 19, Next.js 15 App Router |
| バックエンド | Next.js Route Handlers, Server Actions |
| 認証 | Auth.js v5, Prisma Adapter, bcryptjs, Google OAuth |
| DB | PostgreSQL, Prisma |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI, lucide-react |
| バリデーション | Zod |
| 画像保存 | Local upload, Supabase Storage |
| インフラ / Deploy | Docker, Vercel, Supabase |
| CI | GitHub Actions |
| パッケージ管理 | pnpm |

## 選定技術の採用理由

| 技術 | 採用理由 |
| --- | --- |
| Next.js App Router | Server Components、Route Handlers、Server Actions を同じアプリ内で扱え、フルスタックなSNSアプリを少ない分断で構築できるため。 |
| Auth.js v5 | Next.js App Router と相性がよく、Credentials と Google OAuth を同じ認証基盤で扱えるため。 |
| Prisma | 型安全にDBアクセスでき、複合 index / unique 制約を schema として管理しやすいため。 |
| PostgreSQL | リレーションが多いSNSのデータモデルを素直に表現でき、cursor pagination 用の index 設計もしやすいため。 |
| Tailwind CSS / shadcn/ui | Twitter/X に近い細かな余白、境界線、hover、dark-mode friendly なUIを素早く組み立てられるため。 |
| Zod | Server Actions や Route Handlers の入力境界で、型と実行時バリデーションを揃えられるため。 |

## 主要対応一覧

### ユーザー向け

| 分類 | 対応内容 |
| --- | --- |
| 認証 | メールアドレス / パスワード登録、ログイン、Google OAuth、ログアウト |
| 投稿 | 作成、編集、削除、返信、画像添付、投稿詳細 |
| フィード | おすすめ、フォロー中タイムライン、無限スクロール |
| リアクション | いいね、いいね解除、いいね済み投稿一覧 |
| ユーザー | プロフィール表示、プロフィール編集、投稿 / 返信 / メディア / いいねタブ |
| フォロー | フォロー、フォロー解除、フォロー中一覧、フォロワー一覧 |
| 検索 | ユーザー検索、話題の投稿、最新投稿、メディア検索 |
| メッセージ | 1対1 DM、会話一覧、メッセージ送信 |
| UI | PC 3カラムレイアウト、モバイル下部ナビ、サイドバー、ローディング表示 |

### 非ユーザー向け

| 分類 | 対応内容 |
| --- | --- |
| DB設計 | 投稿、返信、画像、いいね、フォロー、DM、Auth.js 関連テーブル |
| パフォーマンス | cursor pagination、用途別 index、Prisma `select` による取得項目の制御 |
| セキュリティ | サーバー側認証チェック、Server Action 境界の Zod validation、Client Component からの Prisma 非依存 |
| 環境 | `.env.example`、Docker Compose PostgreSQL、local / production upload driver |
| CI | lint、typecheck、build、Prisma migrate deploy workflow |

## ER図

主要モデル:

```txt
User
  ├─ Post
  │   ├─ PostImage
  │   ├─ PostLike
  │   └─ Post replies self relation
  ├─ Follow follower/following relation
  ├─ DirectConversationParticipant
  └─ DirectMessage sender relation

DirectConversation
  ├─ DirectConversationParticipant
  └─ DirectMessage

Auth.js
  ├─ Account
  ├─ Session
  └─ VerificationToken
```

詳細なDB定義は [prisma/schema.prisma](prisma/schema.prisma) を参照してください。

## インフラ構成

```txt
Browser
  ↓
Vercel / Next.js
  ├─ Server Components
  ├─ Server Actions
  ├─ Route Handlers
  └─ Auth.js
       ↓
PostgreSQL / Prisma

Image Upload
  ├─ local: public/uploads
  └─ production: Supabase Storage
```

## ディレクトリ構成

```txt
src/
  app/                 # App Router pages, layouts, route handlers
  components/          # 共通 UI / layout components
  features/
    auth/              # 認証フォーム、Server Actions、schema
    follow/            # フォロー操作
    messages/          # DM 一覧、会話、送信処理
    post/              # 投稿、フィード、検索、いいね
    user/              # プロフィール、ユーザー検索、一覧
  lib/
    auth/              # セッション、権限、認証ヘルパー
    prisma/            # Prisma client
    upload/            # 画像アップロード
prisma/
  schema.prisma        # DB schema
design/                # README / UI確認用スクリーンショット
```

## セットアップ

### 前提

- Node.js 24
- pnpm 9.15.0
- PostgreSQL

このリポジトリでは `pnpm` のみを使用します。`npm`、`yarn`、`bun` は使用しません。

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

Google OAuth や Supabase Storage を使う場合は、`.env.example` にある `AUTH_GOOGLE_*`、`SUPABASE_*` も設定します。

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

## 今後の改善案

- DM の既読 / 未読表示
- 通知機能
- 投稿のブックマーク
- E2E テストの追加
- Supabase Storage の画像削除ジョブ
