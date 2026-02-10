以下、そのまま **README.md** に貼れる「初期設定（新規参加者向け）」テンプレです。
あなたの構成（WSL2 + nvm + `.nvmrc` / pnpm + Corepack / npm-yarn禁止 / `engine-strict` / CI）に合わせています。

````md
# Getting Started（初期設定）

このプロジェクトは **Node / pnpm / lockfile を厳密に固定**しています。  
セットアップは以下の手順で行ってください。

---

## 前提

- WSL2（Ubuntu）
- Git
- nvm（Node Version Manager）

確認：
```bash
git --version
nvm --version
````

---

## 1. リポジトリを取得

```bash
git clone <REPOSITORY_URL>
cd <REPOSITORY_NAME>
```

---

## 2. Node をプロジェクト指定に合わせる（必須）

このプロジェクトは `.nvmrc` で Node バージョンを固定しています。

```bash
nvm install
nvm use
node -v
```

> Node のバージョンが合っていない場合、`pnpm install` がエラーで止まります。

---

## 3. Corepack を有効化（初回のみ）

pnpm は **Corepack 経由**で使います。
※ `corepack enable` は「毎回」ではなく、**Node バージョンごとに1回**でOKです。

```bash
corepack enable
```

pnpm が使えるか確認：

```bash
pnpm -v
```

---

## 4. 依存関係をインストール

⚠️ **npm / yarn は使用禁止**です（CIでも落ちます）

```bash
pnpm install
```

---

## 5. 開発サーバ起動

```bash
pnpm run dev
```

ブラウザ：

* [http://localhost:3000](http://localhost:3000)

---

## 6. 作業前チェック（推奨）

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
```

---

# 重要：禁止事項

* ❌ `npm install`
* ❌ `yarn install`
* ❌ `npm install -g pnpm`（グローバルインストールしない）
* ❌ `package-lock.json` / `yarn.lock` をコミット

---

# よくあるトラブル

## Node バージョンが違うと言われる

```bash
nvm use
node -v
```

## pnpm が見つからない / 古い

```bash
corepack enable
pnpm -v
```

---

# 依存パッケージ追加

* 通常依存：

```bash
pnpm add <package>
```

* 開発依存：

```bash
pnpm add -D <package>
```

追加後は必ず：

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
```

---

# CI について

push / PR 作成時に GitHub Actions が以下を自動実行します：

* Node：`.nvmrc` のバージョンを使用
* pnpm：`package.json` の `packageManager` のバージョンを使用
* `pnpm install --frozen-lockfile`（lockfileがズレていたら失敗）
* lint / typecheck / build

```

---

必要なら、READMEに追加すると便利な章も作れます：

- **「Node/pnpm のバージョンを上げる手順」**
- **「Prisma（migrate/seed）初期セットアップ」**（Supabase/ローカルDocker切替含む）
- **「環境変数 `.env` の用意」**（例テンプレ）
::contentReference[oaicite:0]{index=0}
```
