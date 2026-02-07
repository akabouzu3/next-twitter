import process from "node:process";
import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function readNvmrcMajor() {
  const nvmrcPath = path.join(process.cwd(), ".nvmrc");
  if (!fs.existsSync(nvmrcPath)) {
    fail(`
❌ .nvmrc not found.

Fix:
  Create .nvmrc in project root (e.g. "24")
`);
  }
  const raw = fs.readFileSync(nvmrcPath, "utf8").trim();
  // allow "24" / "v24" / "24.1.0" なども受ける
  const m = raw.replace(/^v/, "").match(/^(\d+)/);
  if (!m) {
    fail(`
❌ Invalid .nvmrc format: "${raw}"

Expected:
  24
  (or v24)
`);
  }
  return Number(m[1]);
}

// 1) Node チェック（.nvmrcに追随）
const requiredMajor = readNvmrcMajor();
const currentNode = process.versions.node;
const currentMajor = Number(currentNode.split(".")[0]);

if (currentMajor !== requiredMajor) {
  fail(`
❌ Node.js version mismatch

  Required : Node ${requiredMajor}.x (from .nvmrc)
  Current  : Node ${currentNode}

Fix:
  nvm use
  (or install Node ${requiredMajor})
`);
}

// 2) pnpm 強制（npm/yarn を弾く）
const ua = process.env.npm_config_user_agent ?? "";
const isPnpm = ua.includes("pnpm/");
if (!isPnpm) {
  fail(`
❌ This project requires pnpm.

Detected: ${ua || "(unknown)"}

Fix:
  corepack enable
  pnpm install
`);
}

console.log(`✅ Guard OK (Node ${currentNode}, pnpm)`);
