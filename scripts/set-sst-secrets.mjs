import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

const secretMappings = [
  ["DATABASE_URL", "DatabaseUrl"],
  ["AUTH_SECRET", "AuthSecret"],
  ["AUTH_GOOGLE_ID", "GoogleId"],
  ["AUTH_GOOGLE_SECRET", "GoogleSecret"],
  ["SUPABASE_URL", "SupabaseUrl"],
  ["SUPABASE_SERVICE_ROLE_KEY", "SupabaseServiceRoleKey"],
  ["SUPABASE_STORAGE_BUCKET", "StorageBucket"],
];

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("pnpm exec node scripts/set-sst-secrets.mjs --stage <staging|production> --env-file .env [--check]");
    console.log("--check: 入力だけ検証し、AWS への通信・Secret 登録は行いません。");
    return;
  }

  let stage;
  let envFile;
  let checkOnly = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--check") {
      checkOnly = true;
    } else if (arg === "--stage" || arg === "--env-file") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} の値が必要です。`);
      }
      if (arg === "--stage") stage = value;
      else envFile = value;
      index += 1;
    } else {
      throw new Error("不明な引数です。--help で使用方法を確認してください。");
    }
  }

  if (!["staging", "production"].includes(stage) || !envFile) {
    throw new Error("--stage staging または --stage production と --env-file を明示してください。");
  }

  let values;
  try {
    values = parseEnv(readFileSync(resolve(envFile), "utf8"));
  } catch {
    throw new Error("指定した環境変数ファイルを読み込めませんでした。");
  }

  const missing = secretMappings
    .map(([envName]) => envName)
    .filter((name) => !values[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`未設定の項目: ${missing.join(", ")}`);
  }

  let databaseUrl;
  let supabaseUrl;
  try {
    databaseUrl = new URL(values.DATABASE_URL);
    supabaseUrl = new URL(values.SUPABASE_URL);
  } catch {
    throw new Error("DATABASE_URL または SUPABASE_URL の形式を確認してください。");
  }

  if (
    !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
    !databaseUrl.hostname.endsWith(".pooler.supabase.com") ||
    databaseUrl.port !== "6543" ||
    !databaseUrl.username ||
    !databaseUrl.password ||
    databaseUrl.searchParams.get("pgbouncer") !== "true"
  ) {
    throw new Error("DATABASE_URL には Supabase Transaction pooler（6543、pgbouncer=true）の接続情報を指定してください。");
  }

  if (
    supabaseUrl.protocol !== "https:" ||
    !supabaseUrl.hostname.endsWith(".supabase.co") ||
    supabaseUrl.username ||
    supabaseUrl.password ||
    supabaseUrl.pathname !== "/" ||
    supabaseUrl.search ||
    supabaseUrl.hash
  ) {
    throw new Error("SUPABASE_URL にはプロジェクトの HTTPS URL を指定してください。");
  }

  // Lambda ごとの接続数を抑える。元ファイルは書き換えず、登録する値にだけ適用する。
  databaseUrl.searchParams.set("connection_limit", "1");
  databaseUrl.searchParams.set("sslmode", "require");
  values.DATABASE_URL = databaseUrl.toString();

  console.log(`${stage} 用の7項目を確認しました。秘密値は表示しません。`);
  if (checkOnly) {
    console.log("チェックのみ完了しました。AWS への通信・登録はしていません。");
    return;
  }

  // 手動操作用の SSO に統一し、シェルに残った固定キーを子プロセスへ引き継がない。
  const childEnv = {
    ...process.env,
    AWS_PROFILE: "k-akabouzu-admin",
    AWS_REGION: "ap-northeast-1",
  };
  delete childEnv.AWS_ACCESS_KEY_ID;
  delete childEnv.AWS_SECRET_ACCESS_KEY;
  delete childEnv.AWS_SESSION_TOKEN;

  function awsText(args) {
    const result = spawnSync("aws", [...args, "--profile", "k-akabouzu-admin"], {
      env: childEnv,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30000,
    });
    if (result.error || result.status !== 0) {
      throw new Error("AWS の接続確認に失敗しました。SSO ログインと AWS CLI 設定を確認してください。");
    }
    return result.stdout.trim();
  }

  const expectedAccountId = awsText(["configure", "get", "sso_account_id"]);
  const actualAccountId = awsText(["sts", "get-caller-identity", "--query", "Account", "--output", "text"]);
  if (!/^\d{12}$/.test(expectedAccountId) || actualAccountId !== expectedAccountId) {
    throw new Error("AWS の接続先が SSO プロファイルの想定アカウントと一致しません。");
  }
  childEnv.AWS_EXPECTED_ACCOUNT_ID = expectedAccountId;

  console.log(`SSO の接続先を確認しました。${stage} の Secret を登録します。`);
  for (const [envName, secretName] of secretMappings) {
    // 値は標準入力にのみ渡す。SST の出力も秘密値の混入を避けるため表示しない。
    const result = spawnSync("pnpm", ["exec", "sst", "secret", "set", secretName, "--stage", stage], {
      input: values[envName],
      env: childEnv,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120000,
    });
    if (result.error || result.status !== 0) {
      throw new Error(`${secretName} の登録に失敗しました。それ以前の項目は登録済みの可能性があります。原因確認後に再実行してください。`);
    }
    console.log(`${secretName}: 登録済み`);
  }
  console.log("7項目の登録が完了しました。デプロイは実行していません。");
}

try {
  main();
} catch (error) {
  // 依存ツールの例外には接続情報が含まれ得るため、独自のエラーメッセージだけを出力する。
  console.error(error instanceof Error ? error.message : "処理に失敗しました。");
  process.exitCode = 1;
}
