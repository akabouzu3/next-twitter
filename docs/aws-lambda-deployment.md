# AWS Lambda デプロイ手順書

作成日：2026-11-14

更新日：2026-11-16

## 1. 目的と前提

このアプリを **SST + OpenNext + AWS Lambda** で動かすための手順です。DB は Supabase PostgreSQL、投稿・プロフィール画像は Supabase Storage を継続利用します。少人数での利用を想定し、RDS、ALB、NAT Gateway は初期構成に追加しません。

**Vercel と AWS Lambda は別 URL で併用します。** 既存 Vercel の本番 URL・DNS・デプロイは維持し、AWS 側は CloudFront の URL で公開します。DB・画像は同じ本番 Supabase を共有します。AWS は `production` を稼働環境とし、別の `staging` は必要になった場合に追加します。

SST と OpenNext の依存関係、`sst.config.ts`、`open-next.config.ts` を追加済みです。OpenNext の互換条件に合わせ、Next.js と対応する ESLint 設定は `15.5.29` へパッチ更新しています。Terraform は使用しません。旧初期構成・ローカル plan は `/tmp/next-twitter-terraform-backup-20261116-013820/` へ退避しました。退避先は一時保存のため、長期保管が必要なら別途保存してください。Terraform の apply と SST の deploy は実行していません。

**SST 導入だけで本番移行が完了するわけではありません。** Prisma の Lambda 向け生成設定を追加済みですが、Lambda 上での DB 接続、画像アップロード、認証、キャッシュの検証を終えてから本番公開します。この手順に含む secret 登録・deploy・remove は今後実行する操作です。

| 項目 | 方針 |
| --- | --- |
| AWS アカウント | AWS Organizations 配下の `K_akabouzu`（`<AWS_ACCOUNT_ID>`） |
| 手動操作の認証 | IAM Identity Center の `akase` → `K_akabouzu` の `AdministratorAccess` 権限セット |
| AWS CLI プロファイル | `k-akabouzu-admin` |
| SSO セッション | `akase-sso`。Identity Center のリージョンは `ap-northeast-1` |
| AWS リージョン | 東京 `ap-northeast-1` |
| IaC / デプロイ | SST の `sst.aws.Nextjs` が AWS 構成とアプリ配置を管理 |
| ビルド | OpenNext。SST が pnpm 経由で実行 |
| 使用バージョン | Next.js `15.5.29` / SST `4.17.2` / OpenNext `4.1.16` / AWS Provider `7.20.0` |
| インフラの管理情報 | SST が管理。Terraform state 用 S3 の手動作成は不要 |
| Next.js の変換 | OpenNext AWS アダプター |
| Lambda | Node.js 24、まずは x86_64 / メモリ 1GB |
| DB 接続 | Supabase Transaction pooler |
| 画像保存 | Supabase Storage。Lambda のローカルディスクには保存しない |
| 環境 | Vercel 本番と AWS `production` を併用。AWS `staging` は任意 |
| 公開ドメイン例 | `staging-aws.example.com` / `app-aws.example.com` |

SSO 設定は、2026-11-16 に確認した `~/.aws/config` に合わせています。実際のアカウント ID は公開文書へ転記せず、`AWS_EXPECTED_ACCOUNT_ID` に設定します。ドメインなどのプレースホルダーは実際の値に置き換えます。Node.js / pnpm は `.nvmrc` と `package.json` の指定に従います。

## 2. 全体構成

```mermaid
flowchart TD
    Browser[ブラウザ] --> CDN[CloudFront]
    CDN --> Assets[S3：静的ファイル]
    CDN --> Server[Lambda：Next.js / OpenNext]
    CDN --> Images[画像最適化用 Lambda]
    Server --> DB[Supabase PostgreSQL / Transaction pooler]
    Browser -->|署名付きアップロード| Storage[Supabase Storage]
    Server -->|アップロード許可・保存結果の検証| Storage
    Browser -->|保存済み画像の表示| Storage
    Server --> Cache[OpenNext キャッシュ関連リソース]
    Server --> Logs[CloudWatch Logs]
```

OpenNext の設定によって、キャッシュ・再検証用の S3、DynamoDB、SQS、補助 Lambda なども作成されます。図は主要な通信経路です。実際に作成されるリソースをステージングで確認し、設定をコードで管理します。

アプリ用 Lambda は VPC に接続せず、TLS で Supabase や Google に接続します。Supabase 側にネットワーク制限がある場合、この構成で接続できるか事前に確認してください。固定送信元 IP が必須の場合は別途ネットワーク設計が必要です。

## 3. 作業の順番

1. AWS アカウント、ドメイン、Supabase 検証環境を準備する。
2. Lambda 向けに Prisma と画像アップロードを対応させる。
3. SST のローカル初期化と、環境別の公開 URL・シークレット設定を行う。
4. 環境ごとのシークレット、公開 URL、Google OAuth を設定する。
5. ローカル検証後、AWS `production` を別 URL へ配置する。検証専用環境が必要なら先に staging を使用する。
6. 認証、投稿、画像、DM、キャッシュ、負荷を確認する。
7. GitHub Actions の OIDC デプロイを整備する。
8. AWS 側の公開 URL と Google OAuth を設定し、Vercel と両方の URL で動作確認する。
9. 監視・費用を確認し、両環境を継続運用する。Vercel の削除・既存 DNS の切り替えは行わない。

## 4. AWS と外部サービスの準備

### 4.1 AWS アカウントと認証

環境の作成先は、AWS Organizations で作成したメンバーアカウント **`K_akabouzu`（`<AWS_ACCOUNT_ID>`）** です。Organizations の管理アカウントへアプリのリソースを作成しません。

手動操作では、IAM Identity Center の **`akase`** ユーザーで AWS アクセスポータルへサインインし、`K_akabouzu` に割り当てられた **`AdministratorAccess` 権限セット**を選択します。Identity Center がそのアカウントに作成する IAM ロールの一時資格情報で操作する流れです。`akase` 用の IAM ユーザーや長期アクセスキーを作成する必要はありません。

1. `akase` に `K_akabouzu` の `AdministratorAccess` 権限セットが割り当てられていることを確認する。
2. Identity Center へのサインインに MFA を使用する。ルートユーザーの認証保護も別に管理する。
3. AWS CLI v2 を用意し、設定済みの `k-akabouzu-admin` プロファイルを使用する。
4. 作業前にアカウント ID が `<AWS_ACCOUNT_ID>` であることを毎回照合する。
5. AWS Budgets で `K_akabouzu` の月額予算と通知先を設定する。請求閲覧に必要な権限や Organizations の設定は別途確認する。通知は自動的な利用停止ではない。

```bash
aws sso login --profile k-akabouzu-admin
aws sts get-caller-identity --profile k-akabouzu-admin
```

現在の `~/.aws/config` は次の構成です。既に設定済みの端末では、`aws configure sso` の再実行は不要です。

| 設定 | 値 / 用途 |
| --- | --- |
| `profile k-akabouzu-admin` | アプリの構築・運用に使用するプロファイル |
| `sso_account_id` | `<AWS_ACCOUNT_ID>` |
| `sso_role_name` | `AdministratorAccess` |
| `sso_session` | 共通の `akase-sso` を参照 |
| `sso-session akase-sso` の `sso_region` | `ap-northeast-1` |
| プロファイルの `region` / `output` | `ap-northeast-1` / `json` |
| `profile management-admin` | 管理アカウント用。アプリの配置には使用しない |
| `default` | 東京リージョンと JSON 出力のみ。認証設定はない |

新しい端末で設定する場合のみ、`aws configure sso --profile k-akabouzu-admin` を実行し、組織の Start URL、SSO セッション `akase-sso`、SSO リージョン `ap-northeast-1`、アカウント `K_akabouzu`、ロール `AdministratorAccess` を指定します。**Identity Center とアプリのリージョンは別の設定ですが、現在はいずれも東京です。** CloudFront 用の証明書は引き続き `us-east-1` に作成します。

`get-caller-identity` の `Account` が `<AWS_ACCOUNT_ID>` と一致し、`Arn` が `AWSReservedSSO_AdministratorAccess_…` を含む想定の引き受けロールになっていることを確認します。アカウント表示名ではなく ID で照合してください。`AdministratorAccess` は管理者権限のロールであり、ルートユーザーとしてのログインではありません。

以降のローカルコマンドは、このプロファイルとリージョンを使用します。別アカウントの `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` が環境変数に残っていないことも確認してください。

```bash
export AWS_PROFILE=k-akabouzu-admin
export AWS_REGION=ap-northeast-1
```

SSO セッションが切れた場合は `aws sso login --profile k-akabouzu-admin` を再実行します。SST を手動実行する場合も、この一時資格情報を使用します。プロファイルを省略して `default` や `management-admin` を使わないようにしてください。

`AdministratorAccess` でも、Organizations の SCP などによる制限は受けます。作成が拒否された場合は対象アカウント・権限セット・組織側の制限を確認します。

手動操作用の管理権限、GitHub Actions のデプロイ権限、Lambda の実行権限は分けます。CI には後述の専用 OIDC ロールを使用し、Identity Center の一時資格情報を GitHub へ登録しません。アプリ実行ロールへ `AdministratorAccess` を付与しないでください。

### 4.2 Supabase

1. ステージング用の Supabase プロジェクトと画像バケットを用意する。本番 DB と共有しない。
2. AWS と近いリージョンを選ぶ。既存の本番プロジェクトを継続する場合は、そのリージョンと遅延を確認する。
3. アプリ用 Transaction pooler URL と、Prisma CLI 用 Direct / Session pooler URL を取得する。
4. 画像バケットの形式・サイズ制限を設定する。現在の画像表示は公開 URL を前提としているため、公開バケットには公開画像だけを保存する。
5. 既存本番 DB のバックアップ・復元手段と、Storage のバックアップを個別に確認する。

認証は既存の Auth.js を継続します。Supabase Auth への移行は不要です。

### 4.3 ドメインと証明書

最初は既存本番と別のサブドメインを推奨します。既存の Route 53 Hosted Zone を SST から使用するか、外部 DNS を使用するかを決めます。既存ゾーンを二重作成しないでください。

CloudFront 用の ACM 証明書は `us-east-1` が必要です。SST が作成する証明書・DNS 検証・CloudFront の代替ドメイン設定を確認し、必要なリージョンの権限を用意します。外部 DNS を使う場合は、検証・配信用レコードの登録を外部 DNS 側で行い、反映を確認します。

## 5. このリポジトリで必要な実装

### 5.1 Prisma の接続と Lambda バイナリ

現在は Prisma 6 の `prisma-client-js` を使用しています。Linux CI で生成するだけでなく、Lambda 向けエンジンが成果物に含まれることを確認します。

Node.js 24 / x86_64 を採用する場合の `prisma/schema.prisma` の generator 設定候補：

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

ARM64 を選ぶ場合は対応するターゲットに変更します。生成後のエンジンが OpenNext の Lambda 配布物にコピーされているかも確認し、ステージングで実際に DB クエリを実行してください。generator 設定だけの変更に DB マイグレーションは不要です。

実行時の接続文字列は Supabase Dashboard の値を使用します。例：

```text
DATABASE_URL=postgresql://USER:PASSWORD@POOLER_HOST:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@SESSION_POOLER_HOST:5432/postgres?sslmode=require
```

パスワードは URL エンコードします。既存のクエリパラメーターがある場合は `&` で追加します。上記は共有 Transaction pooler と Prisma 6 を想定し、接続方式は Supabase の現行案内と照合します。

* `DATABASE_URL` はアプリ実行用。まず `connection_limit=1` から検証する。
* `DIRECT_URL` は Prisma CLI 用。既存の `prisma.config.ts` が参照する。IPv4 環境では到達可能な Session pooler の利用も検討する。
* 既存の Prisma Client 再利用パターンを維持し、リクエストごとに `$disconnect()` しない。
* Lambda の同時実行数と接続上限の積、Supabase 側のプール上限を確認する。接続プーラーがあっても無制限には増やさない。
* Lambda の予約済み同時実行数は AWS アカウントの枠を確認して決める。小さい値が設定できないアカウントもあるため、固定値を前提にしない。

### 5.2 画像の直接アップロード

現在は Server Actions で画像を受け取り、`src/lib/upload/save-supabase-image.ts` から Storage へ保存しています。共通上限は各画像 2MiB、合計 4MiB、Next.js 側の `bodySizeLimit` は 20MB です。

Lambda の同期リクエストには 6MB のペイロード制限があり、バイナリが Base64 化されると約 4/3 に増え、イベント情報も加わります。現行の合計 4MiB が常に安全とは判断せず、**本番公開前にブラウザから Supabase Storage へ直接送信する方式へ変更する**方針とします。

実装の流れ：

1. ブラウザから枚数・サイズ・形式などのメタデータをアプリへ送信する。
2. サーバーがセッション・操作権限・利用上限を検証する。
3. サーバーでユーザーに紐づく UUID ベースの保存キーを作り、署名付きアップロード URL / トークンを返す。
4. ブラウザがファイルを Storage へ直接アップロードする。
5. ブラウザが投稿本文とアップロード識別子を Server Action に送信する。
6. サーバーが許可済みキー、所有者、実際のファイル数・サイズ・形式、アップロード完了を検証して DB を更新する。クライアントから渡された任意の公開 URL は受け入れない。
7. 保存済み画像の削除、失敗時の再試行、未使用画像の期限付き掃除を実装する。

検証用の未確定画像は公開前に確認できる配置にし、署名発行のメタデータだけを信用しないでください。拡張子・申告 MIME だけではなく実体も検証します。Storage 側の制限も併用し、直接送信になってもサーバー側検証を維持します。

投稿、投稿編集、プロフィール画像、背景画像のすべてを対象にします。`SUPABASE_SERVICE_ROLE_KEY` はサーバー専用とし、ブラウザへ返しません。Storage の署名 API、必要な依存関係、CORS は採用する方式で確認します。

### 5.3 認証・キャッシュ

* Auth.js の公開 URL とプロキシ経由のホスト判定を検証する。`AUTH_TRUST_HOST=true` だけで認証確認を完了した扱いにしない。
* `src/middleware.ts` の `/admin` 制御、認証 Cookie、ログイン後のリダイレクトを検証する。
* 認証 API、ログイン済みユーザー向けページ、DM のレスポンスを共有キャッシュへ保存しない。OpenNext 標準の挙動を確認し、CloudFront に全パス一律のキャッシュルールを追加しない。
* 2 ユーザーで交互にアクセスし、HTML、RSC、API レスポンスから他人の情報が返らないことを確認する。
* `revalidatePath` と OpenNext のキャッシュ・再検証用リソースの権限を確認する。
* デプロイ直前から開いていた画面でも Server Actions が適切に動くか確認する。暗号化キー・バージョンずれの扱いは、Next.js / OpenNext の採用バージョンに合わせる。

## 6. SST / OpenNext の導入

### 6.1 それぞれの役割

* **Next.js**：アプリをビルドする。
* **OpenNext**：ビルド結果を Lambda 向けに変換し、キャッシュ・画像最適化などを橋渡しする。
* **SST**：Lambda、CloudFront、S3、IAM、キャッシュ・再検証関連リソースの作成とアプリ配置をまとめて行う。

Lambda コード・静的ファイル・キャッシュの配置は SST を更新元とし、AWS CLI で個別に変更する二重管理を避けます。SST の state や初期化用リソースは SST に管理させます。

### 6.2 追加したファイルと依存関係

| ファイル | 役割 |
| --- | --- |
| `sst.config.ts` | 対象環境・AWS Provider・Nextjs コンポーネント・実行時設定 |
| `open-next.config.ts` | Next.js のビルドを `pnpm build` で実行 |
| `package.json` / `pnpm-lock.yaml` | SST `4.17.2` / OpenNext `4.1.16` を固定 |
| `.gitignore` | `.sst/`・`.open-next/`・生成型を Git 対象外にする |
| `tsconfig.json` / `eslint.config.mjs` | アプリの検証に SST の生成物を混在させない |
| `tsconfig.sst.json` | `pnpm typecheck:infra` で SST 設定を別途型チェック |

通常のアプリ開発には引き続き `pnpm dev` を使います。`sst dev` は AWS 側のリソースを作成・使用し得るため、ローカルだけで動くコマンドとは扱いません。

### 6.3 初期化

既存の SSO プロファイルを使用し、想定アカウント ID はローカル設定から取得します。

```bash
export AWS_PROFILE=k-akabouzu-admin
export AWS_REGION=ap-northeast-1
export AWS_EXPECTED_ACCOUNT_ID="$(aws configure get sso_account_id --profile k-akabouzu-admin)"
aws sts get-caller-identity
pnpm install --frozen-lockfile
pnpm exec sst install --stage staging
```

SSO セッション切れなら `aws sso login --profile k-akabouzu-admin` を先に実行します。`get-caller-identity` のアカウントを記録済みの `K_akabouzu` の ID と照合してください。Provider にも `allowedAccountIds` を設定していますが、SST 自身の初期化先の確認も必要です。

`sst install` は SST 用 Provider・型などのローカル準備を行います。AWS リソースを作る `deploy` とは別です。Provider バージョンは `sst.config.ts` で固定し、更新時は再度 `sst install` と検証を実施します。

### 6.4 設定の方針

`sst.config.ts` には次を設定しています。

* 環境名は `staging` と `production` のみ。コマンドで `--stage` を省略しない。
* 東京リージョン、Node.js 24 / x86_64 / 1GB / タイムアウト30秒。
* ビルドは `pnpm exec open-next build`。SST の既定の `npx` コマンドは使わない。
* OpenNext はインストール済みの `4.1.16` と同じバージョンを指定。
* 画像保存先は `supabase`。`staging` の `APP_ENV` は既存コードに合わせて `development`。
* 本番は `protect: true` と `removal: "retain"`。検証環境は `removal: "remove"`。

本番の保護・保持設定はバックアップの代わりにはなりません。生成された構成・権限と変更内容は公開前に確認します。

## 7. 環境変数とシークレット

### 7.1 デプロイ設定

| 名前 | 設定内容 |
| --- | --- |
| `AWS_PROFILE` | ローカルは `k-akabouzu-admin`。CI では指定せず OIDC を使用 |
| `AWS_EXPECTED_ACCOUNT_ID` | 想定する `K_akabouzu` の12桁の ID。公開コードには書き込まない |
| `AWS_APP_ORIGIN` | 環境の HTTPS 公開 URL。末尾のパス・クエリ・認証情報は不可 |
| `AWS_APP_DOMAIN` | 独自ドメインを使う場合のみ、スキームなしのホスト名を指定 |
| `AWS_BOOTSTRAP_ORIGIN` | AWS production 初回の仮 URL 配置でのみ `true`。実 URL 確定後は解除 |
| `DIRECT_URL` | Prisma CLI ジョブ用。Lambda の環境変数には渡さない |

`AWS_APP_ORIGIN` はアプリの `APP_ORIGIN`、`AUTH_URL`、`NEXT_PUBLIC_APP_ORIGIN` に反映します。`NEXT_PUBLIC_*` はビルド時に埋め込まれるため、公開 URL の変更時は再ビルド・再デプロイが必要です。

独自ドメインを指定する現在の設定は、同じ AWS アカウントの Route 53 で DNS を管理する前提です。外部 DNS の場合は SST の `domain` 設定を対応する方式へ変更してから実行します。

### 7.2 SST Secret

| Secret 名 | アプリへ渡す環境変数 |
| --- | --- |
| `DatabaseUrl` | `DATABASE_URL`（Transaction pooler） |
| `AuthSecret` | `AUTH_SECRET` |
| `GoogleId` | `AUTH_GOOGLE_ID` |
| `GoogleSecret` | `AUTH_GOOGLE_SECRET` |
| `SupabaseUrl` | `SUPABASE_URL` |
| `SupabaseServiceRoleKey` | `SUPABASE_SERVICE_ROLE_KEY` |
| `StorageBucket` | `SUPABASE_STORAGE_BUCKET` |

環境ごとに7個すべて登録します。機密値をコマンド引数や Git 管理対象のファイルへ書きません。標準入力で登録する例：

```bash
# リポジトリ外の一時ファイルへエディターで値を保存し、登録後に削除する。
chmod 600 /tmp/next-twitter-database-url.txt
pnpm exec sst secret set DatabaseUrl --stage staging < /tmp/next-twitter-database-url.txt
rm /tmp/next-twitter-database-url.txt
```

手元の環境変数ファイルから対象環境の7項目をまとめて登録する場合は、専用スクリプトを使用できます。元ファイルは変更せず、値は標準入力で SST へ渡します。DB 接続には `connection_limit=1` と `sslmode=require` を付けて登録します。

```bash
# 入力の確認のみ。AWS への通信・登録はしない。
pnpm exec node scripts/set-sst-secrets.mjs --stage staging --env-file .env --check
# SSO の接続先を照合し、7項目を登録する。既存の同名 Secret は上書きされる。
pnpm exec node scripts/set-sst-secrets.mjs --stage staging --env-file .env
```

このスクリプトは `staging` と `production` に対応し、指定した環境の Secret だけを登録します。staging に登録済みでも production へ自動的には引き継がれません。ローカル DB の URL は登録できません。本番の Supabase を共有する場合も、検証用ユーザーのデータに操作を限定してください。SST Secret の登録は AWS 側に管理用リソースを作成する場合がありますが、アプリのデプロイや DB の変更は実行しません。途中で失敗した場合は一部だけ登録済みになる可能性があり、再実行時も同じ入力で上書きします。

同じ方法で残りの Secret と `production` 用の別の値を登録します。認証用 Secret は同じ環境内で継続使用します。登録・更新後はデプロイで反映します。

SST Secret は AWS Secrets Manager を直接使用するものではありません。管理情報・成果物・Lambda の設定にも秘密情報が含まれ得るため、アクセス権を制限します。`secret list` など秘密情報を出力し得る操作を公開ログに流さないでください。

ルートの `.env` はローカル用です。クリーンな CI チェックアウトを基本とし、SST と Next.js が読むビルド時・実行時の値を確認して、`localhost` や別環境の接続先が混ざらないようにします。

## 8. Google OAuth と公開 URL

Google Cloud Console でステージごとの OAuth クライアントを用意し、コールバック URL を登録します。

```text
https://staging-aws.example.com/api/auth/callback/google
https://app-aws.example.com/api/auth/callback/google
```

必要に応じて承認済みドメイン・テストユーザー・同意画面も設定します。既存 Vercel の URL は移行完了まで残します。公開ドメインを変える場合、Cookie は引き継がれないため再ログインが必要です。

独自ドメインなしでも CloudFront の HTTPS URL で公開できます。初回の仮 URL では認証を利用できません。production の初回のみ `AWS_BOOTSTRAP_ORIGIN=true` を明示し、厳密に `https://bootstrap.invalid` だけを許可します。URL 確定後はフラグを解除して再デプロイします。Vercel の Google コールバックは削除せず、AWS のコールバックを追加してください。具体的なコマンドは第12節に記載します。

## 9. ローカル検証とステージングデプロイ

### 9.1 DB 状態の確認

ステージング DB に既存マイグレーションが適用されているか確認します。新規 DB なら適用が必要です。既存 DB を継続利用しスキーマも変えない場合、AWS 移行だけを理由に新しいマイグレーションを作る必要はありません。

対象 DB とバックアップを確認し、承認された作業として実行します。

```bash
pnpm exec prisma migrate status
# 未適用のマイグレーションを確認し、適用を承認された場合のみ実行
pnpm exec prisma migrate deploy
```

このジョブには実際の `DIRECT_URL` を渡します。`migrate dev`、`db push`、`migrate reset` は本番で使用しません。マイグレーションを Lambda の起動処理や各リクエストで実行しないでください。

### 9.2 検証

```bash
pnpm install --frozen-lockfile
pnpm exec sst install --stage staging
pnpm exec prisma generate
pnpm lint
pnpm typecheck
pnpm typecheck:infra
pnpm build
pnpm exec open-next build
```

`prisma generate` のみなら DB 接続は不要ですが、このリポジトリでは `DATABASE_URL` / `DIRECT_URL` の形式が必要です。生成だけのジョブにはダミー URL を使用できます。ビルド時に実データを取得する処理がある場合は、検証用 DB 接続情報を使用します。

通常の Next.js ビルドと OpenNext ビルドの両方が成功することを確認します。SST のデプロイ時も OpenNext ビルドが実行されます。SST の型は `sst install --stage staging` で生成し、アプリ本体とは分けて確認します。

### 9.3 ステージングへ配置

前述の認証・シークレット設定を完了し、公開 URL を指定して配置します。独自ドメインを使う例：

```bash
export AWS_APP_ORIGIN=https://staging-aws.example.com
export AWS_APP_DOMAIN=staging-aws.example.com
pnpm exec sst deploy --stage staging
```

ドメインなしで初回配置する場合は第8節の手順を使います。`deploy` は AWS リソースを作成・更新し、料金が発生します。アカウント、環境、Git SHA、SST の出力 URL、リソース一覧を記録します。CloudFront・DNS・証明書の反映を待ってから確認してください。

## 10. ステージングの合格条件

| 確認対象 | 合格条件 |
| --- | --- |
| 起動 | 公開ページを表示でき、Prisma Engine のロードエラーがない |
| 認証 | メール・パスワード、Google、ログアウト、再読み込みが成功する |
| 権限 | 未ログイン、一般ユーザー、管理者のアクセス制御が正しい |
| 投稿 | 投稿・編集・削除・返信・いいね・フォローが動く |
| 一覧 | フィード・検索・ユーザー一覧のカーソルページングが動く |
| 画像 | 投稿・プロフィール・背景画像が保存・表示できる |
| アップロード制約 | 上限値・超過・偽装形式・他人のキー・再送を検証する |
| DM | 送受信でき、他人の会話を URL や API の直接呼び出しで取得できない |
| キャッシュ | 別ユーザーの情報が混ざらず、更新が画面へ反映される |
| 再デプロイ | 画像・投稿が残り、開いたままの画面の更新失敗を扱える |
| 低頻度利用 | しばらく無アクセス後の初回アクセス時間を測定する |
| 接続数 | 小規模な同時アクセスで DB 接続上限やタイムアウトに達しない |
| 秘密情報 | HTML、ブラウザ用 JS、ログに DB URL・サービスキーが出ない |

テスト用ユーザー 2 人以上で確認します。通常操作だけでなく、直接 API / Server Actions を呼んだ場合の認可も検証してください。

## 11. GitHub Actions からのデプロイ

既存の `.github/workflows/ci.yml` は PR の lint・型チェック・ビルド用です。AWS デプロイ用ワークフローを別に追加します。

1. `akase` から `K_akabouzu` の `AdministratorAccess` を利用し、同アカウントに GitHub 用 OIDC Provider と専用デプロイロールを用意する。初回は SSO 資格情報で構築し、CI の認証を確立する。デプロイロールには SST の管理情報・成果物・管理対象サービスと、制限した `iam:PassRole` など必要な権限を設定する。
2. 信頼ポリシーの `aud` を `sts.amazonaws.com`、`sub` をこのリポジトリの対象 Environment に限定する。例：`repo:akabouzu3/next-twitter:environment:production`。
3. GitHub Environments に `staging` / `production` を用意し、本番は承認と許可ブランチを設定する。
4. ワークフローに `permissions: { contents: read, id-token: write }` を指定する。
5. AWS 認証は `aws-actions/configure-aws-credentials` の OIDC を使用する。長期アクセスキーを GitHub に保存しない。
6. Node.js / pnpm は既存 CI と同じくリポジトリの指定から取得する。
7. 同じステージのデプロイは `concurrency` で直列化する。実行中の IaC 更新を途中キャンセルしない方針にする。

ジョブの順序：

```text
checkout
→ Node.js / pnpm の準備
→ pnpm install --frozen-lockfile
→ OIDC による AWS 認証とアカウント確認
→ pnpm exec sst install --stage <対象環境>
→ pnpm exec prisma generate
→ lint / typecheck / build
→ pnpm typecheck:infra
→ DB 変更がある場合は承認済み migration ジョブ
→ 本番は GitHub Environment の承認後に deploy
→ pnpm exec sst deploy --stage <staging または production>
→ 公開 URL のスモークテスト
```

公開 URL、独自ドメイン、想定アカウント ID は GitHub Environment Variables、Prisma CLI 用接続情報は Environment Secrets から渡します。アプリの SST Secret は事前登録し、毎回上書きしません。ローカル用 `AWS_PROFILE` や SSO の一時資格情報は CI に登録せず、OIDC を使用します。

デプロイログには Git SHA、対象環境、公開 URL、成否を残します。失敗時は SST の状態・ロックと AWS 側の状態を確認し、途中の更新を無視して次の deploy を重ねないでください。SST の設定と異なる変更を手作業で加えない方針にします。

## 12. Vercel と AWS production の併用

### 12.1 production の Secret 登録

Vercel の設定とドメインは維持します。AWS の staging に登録済みの Secret は production へ自動共有されないため、以下で production 用を用意します。秘密値は画面に表示しません。

```bash
pnpm exec node scripts/set-sst-secrets.mjs --stage production --env-file .env --check
pnpm exec node scripts/set-sst-secrets.mjs --stage production --env-file .env
```

### 12.2 初回配置と CloudFront URL の取得

本番 DB / Storage のバックアップを確認し、Git SHA を記録します。今回の配置で DB スキーマを変更する必要はなく、マイグレーションは自動実行しません。

```bash
export AWS_PROFILE=k-akabouzu-admin
export AWS_REGION=ap-northeast-1
export AWS_EXPECTED_ACCOUNT_ID="$(aws configure get sso_account_id --profile k-akabouzu-admin)"
export AWS_APP_ORIGIN=https://bootstrap.invalid
export AWS_BOOTSTRAP_ORIGIN=true
unset AWS_APP_DOMAIN
pnpm exec sst deploy --stage production
```

初回は URL 取得用の配置です。認証の動作確認や利用者への URL 案内は、次の再デプロイ後に行います。この操作では AWS リソースが作成・更新され、料金が発生します。

### 12.3 実 URL へ設定して再配置

出力された CloudFront URL を `AWS_APP_ORIGIN` に設定し、Google Cloud Console に `https://<CloudFrontのホスト名>/api/auth/callback/google` を追加します。既存 Vercel の設定は残します。

```bash
export AWS_APP_ORIGIN="https://<実際のCloudFrontのホスト名>"
unset AWS_BOOTSTRAP_ORIGIN
pnpm exec sst deploy --stage production
```

上記の URL は実際の値に置き換えます。ブラウザ用の公開 URL もビルド時に更新されます。初回配置のビルド済みファイルに実行時設定だけを変えて流用しません。

### 12.4 両環境の確認と継続運用

* Vercel と AWS の各 URL でログイン・投稿・画像・DMを確認する。第10節の合格条件を AWS 側にも適用する。
* Supabase は共有しているため、AWS 側の更新・削除も本番データへ反映される。初期確認は検証用ユーザーのデータに限定する。
* ログイン Cookie は URL ごとに別管理となるため、それぞれログインする。
* DB が同じでも Next.js のキャッシュは別。片方の `revalidatePath` がもう片方のキャッシュも更新するわけではないため、両方で更新の反映を確認する。
* DB スキーマを変更する場合は両方のアプリと互換性を維持する。マイグレーションは一度だけ、承認されたジョブから適用する。
* AWS と Vercel 両方の実行・配信費用、合計した Supabase の接続数・転送量を監視する。
* Vercel の削除や既存ドメインの移管は行わない。AWS 用の独自ドメインが欲しくなった場合は別のサブドメインを追加する。

## 13. 監視と費用管理

* CloudWatch：Lambda の Errors、Throttles、Duration、ConcurrentExecutions を確認する。
* ログ保持期間を設定する。初期候補は 14 日とし、運用要件で調整する。
* CloudFront の 5xx、DB 接続数、Storage の転送量・容量を確認する。
* 外形監視と通知先を用意し、実際に通知が届くことを確認する。
* 最初は Provisioned Concurrency やウォーマーを有効にしない。必要性を測ってから追加する。
* SSR、画像最適化、再検証の Lambda は別々に呼び出され得るため、ページ数だけで料金を見積もらない。
* CloudFront の料金プランは SST の設定と実際に作成したリソースで確認する。無料プランが自動適用されるとは仮定しない。
* SST の管理情報・成果物用 S3、OpenNext 用 S3 / DynamoDB / SQS、CloudWatch、DNS、Supabase、CI の料金も確認する。SST と OpenNext 自体の利用に AWS サービス料金は含まれない。任意の SST Console など有料サービスを使う場合は別途見積もる。
* ステージングも費用が発生する。AWS Budgets の通知と Cost Explorer でサービス別費用を確認する。

## 14. 障害時の切り戻し

### アプリの更新だけを戻す場合

1. 障害のあるリリースと直前に正常だった Git SHA を特定する。
2. 正常だった Git SHA をクリーンなチェックアウトで開き、当時のロックファイルと対象環境の設定を使って `sst deploy --stage <対象環境>` で再配置する。
3. シークレット、インフラ、DB の互換性を確認する。コードを戻すだけで DB や秘密情報は元に戻らない。
4. CloudFront の反映と認証・投稿などのスモークテストを確認する。

### AWS 側で問題が起きた場合

1. Vercel 側の動作と共有 DB / Storage への影響を確認する。
2. AWS 側への利用案内を停止し、Vercel の URL を使用する。既存 DNS の切り替えは不要。
3. AWS の直前の正常版を再配置するか、原因を修正する。
4. 両環境で動作確認してから AWS 側の利用を再開する。

DB マイグレーションを自動で逆適用しないでください。復元が必要なら、バックアップ後に増えた投稿や DM が失われる影響を確認して、別の承認済み復旧作業として扱います。

## 15. 検証環境の撤去

不要になった `staging` は、対象アカウントと環境を確認し、必要なデータを保存した後に削除します。

```bash
pnpm exec sst remove --stage staging
```

現在の設定では `run()` でも公開 URL を検証するため、remove の際も対象環境の `AWS_APP_ORIGIN` と、使用していた場合は `AWS_APP_DOMAIN` を設定します。

SST の管理情報・Secret、保持されたバケット、ログ、DNS、Supabase プロジェクトなどが残る場合があります。撤去後もリソース一覧と請求を確認します。`production` の保護を解除して削除する操作は通常手順に含めません。

## 16. 実装・構築チェックリスト

- [ ] AWS / Supabase のステージング環境を用意した
- [x] SST / OpenNext の依存バージョンを固定した
- [ ] SST の Provider と生成構成・権限を確認した
- [x] `package.json` と `pnpm-lock.yaml` をセットで更新した
- [ ] Prisma の実行バイナリと DB 接続を Lambda 上で検証した
- [ ] 画像の直接アップロードと保存後検証を実装した
- [x] SST / OpenNext の設定と生成物の ignore を追加した
- [ ] SST が作成する CloudFront のルーティング・権限を検証した
- [ ] 環境別シークレット・Google OAuth・公開 URL を設定した
- [x] lint、アプリ / SST の型チェック、通常ビルド、OpenNext ビルドを確認した
- [ ] ステージングの機能・認可・キャッシュ・再デプロイを検証した
- [ ] GitHub Actions の OIDC と本番承認を設定した
- [ ] 監視、通知、バックアップ、費用管理を設定した
- [ ] 切り戻し方法と旧環境の保持期間を決めた
- [ ] 本番公開後の動作と請求を確認した

## 17. 公式リファレンス

仕様と料金は変更されるため、実装時には採用バージョンの資料を再確認します。

* [OpenNext AWS：導入](https://opennext.js.org/aws/get_started)
* [OpenNext AWS：設定](https://opennext.js.org/aws/config)
* [OpenNext AWS：参照実装](https://opennext.js.org/aws/reference-implementation)
* [SST：Next.js on AWS](https://sst.dev/docs/start/aws/nextjs/)
* [SST：Nextjs コンポーネント](https://sst.dev/docs/component/aws/nextjs/)
* [SST：Secret](https://sst.dev/docs/component/secret/)
* [SST：IAM Credentials](https://sst.dev/docs/iam-credentials/)
* [SST：CLI](https://sst.dev/docs/reference/cli/)
* [AWS：CloudFront から Lambda Function URL への OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html)
* [AWS：Lambda のクォータ](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
* [Prisma 6：AWS Lambda へのデプロイ](https://www.prisma.io/docs/orm/v6/prisma-client/deployment/serverless/deploy-to-aws-lambda)
* [Supabase：Prisma](https://supabase.com/docs/guides/database/prisma)
* [Supabase：DB 接続方式](https://supabase.com/docs/guides/database/connecting-to-postgres)
* [Supabase：署名付きアップロード URL](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)
* [Next.js 15：環境変数](https://nextjs.org/docs/15/app/guides/environment-variables)
