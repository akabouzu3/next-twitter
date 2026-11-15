import type { OpenNextConfig } from "@opennextjs/aws/types/open-next";

const config = {
  default: {},
  // SST 経由のビルドでも、このプロジェクトの pnpm スクリプトを使う。
  buildCommand: "pnpm build",
} satisfies OpenNextConfig;

export default config;
