import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function readNvmrcMajor() {
  const nvmrcPath = path.join(process.cwd(), ".nvmrc");
  const raw = fs.readFileSync(nvmrcPath, "utf8").trim();
  const m = raw.replace(/^v/, "").match(/^(\d+)/);
  if (!m) fail(`Invalid .nvmrc: "${raw}"`);
  return Number(m[1]);
}

const major = readNvmrcMajor();
const pkgPath = path.join(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.engines ??= {};
pkg.engines.node = `>=${major} <${major + 1}`;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`✅ synced package.json engines.node to ">=${major} <${major + 1}"`);
