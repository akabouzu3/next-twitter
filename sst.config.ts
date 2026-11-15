/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    if (input.stage !== "staging" && input.stage !== "production") {
      throw new Error("--stage staging または --stage production を指定してください。");
    }

    const expectedAccountId = process.env.AWS_EXPECTED_ACCOUNT_ID;
    if (!expectedAccountId || !/^\d{12}$/.test(expectedAccountId)) {
      throw new Error("AWS_EXPECTED_ACCOUNT_ID に K_akabouzu の12桁のIDを設定してください。");
    }

    return {
      name: "next-twitter",
      home: "aws",
      // 本番は通常の remove を禁止し、設定変更時も重要なデータを保持する。
      protect: input.stage === "production",
      removal: input.stage === "production" ? "retain" : "remove",
      providers: {
        aws: {
          version: "7.20.0",
          region: "ap-northeast-1",
          allowedAccountIds: [expectedAccountId],
        },
      },
    };
  },
  async run() {
    const originInput = process.env.AWS_APP_ORIGIN;
    if (!originInput) {
      throw new Error("AWS_APP_ORIGIN に配置先のHTTPS公開URLを設定してください。");
    }

    const originUrl = new URL(originInput);
    if (
      originUrl.protocol !== "https:" ||
      originUrl.username ||
      originUrl.password ||
      originUrl.pathname !== "/" ||
      originUrl.search ||
      originUrl.hash
    ) {
      throw new Error("AWS_APP_ORIGIN はパスや認証情報を含まないHTTPSのURLにしてください。");
    }

    // CloudFront URL が未確定の初回だけ、明示した場合に仮 URL を許可する。
    const bootstrapOrigin = process.env.AWS_BOOTSTRAP_ORIGIN === "true";
    if (bootstrapOrigin && originUrl.origin !== "https://bootstrap.invalid") {
      throw new Error("初回配置後は AWS_BOOTSTRAP_ORIGIN を解除してください。");
    }
    if (
      $app.stage === "production" &&
      originUrl.hostname.endsWith(".invalid") &&
      !(bootstrapOrigin && originUrl.origin === "https://bootstrap.invalid")
    ) {
      throw new Error("production の仮URLは初回配置時だけ AWS_BOOTSTRAP_ORIGIN=true で使用できます。");
    }

    // 独自ドメインは DNS / 証明書の準備後に指定する。未指定なら CloudFront URL を使う。
    const domain = process.env.AWS_APP_DOMAIN;
    if (bootstrapOrigin && domain) {
      throw new Error("初回の仮URLで配置する場合は AWS_APP_DOMAIN を解除してください。");
    }
    if (domain && originUrl.host !== domain) {
      throw new Error("AWS_APP_DOMAIN と AWS_APP_ORIGIN のホストを一致させてください。");
    }

    const databaseUrl = new sst.Secret("DatabaseUrl");
    const authSecret = new sst.Secret("AuthSecret");
    const googleId = new sst.Secret("GoogleId");
    const googleSecret = new sst.Secret("GoogleSecret");
    const supabaseUrl = new sst.Secret("SupabaseUrl");
    const supabaseKey = new sst.Secret("SupabaseServiceRoleKey");
    const storageBucket = new sst.Secret("StorageBucket");

    const web = new sst.aws.Nextjs("Web", {
      domain,
      openNextVersion: "4.1.16",
      // SST の既定コマンドに依存せず、インストール済みの OpenNext を実行する。
      buildCommand: "pnpm exec open-next build",
      dev: { command: "pnpm dev" },
      server: {
        runtime: "nodejs24.x",
        architecture: "x86_64",
        memory: "1024 MB",
        timeout: "30 seconds",
      },
      environment: {
        APP_ENV: $app.stage === "production" ? "production" : "development",
        APP_ORIGIN: originUrl.origin,
        NEXT_PUBLIC_APP_ORIGIN: originUrl.origin,
        AUTH_URL: originUrl.origin,
        DATABASE_URL: databaseUrl.value,
        AUTH_SECRET: authSecret.value,
        AUTH_TRUST_HOST: "true",
        AUTH_GOOGLE_ID: googleId.value,
        AUTH_GOOGLE_SECRET: googleSecret.value,
        IMAGE_STORAGE_DRIVER: "supabase",
        SUPABASE_URL: supabaseUrl.value,
        SUPABASE_SERVICE_ROLE_KEY: supabaseKey.value,
        SUPABASE_STORAGE_BUCKET: storageBucket.value,
      },
    });

    return { url: web.url };
  },
});
