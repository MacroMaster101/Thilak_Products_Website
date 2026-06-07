import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Playwright does NOT auto-load .env files, but specs that import @/lib/prisma
// need DATABASE_URL populated before that module is imported. This dependency-free
// loader (mirroring tests/setup-env.ts) reads .env.local (preferred) or .env into
// process.env. Import this module FIRST in any spec that touches prisma.
function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf-8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const root = resolve(__dirname, "..", "..");
if (existsSync(resolve(root, ".env.local"))) {
  loadEnvFile(resolve(root, ".env.local"));
} else {
  loadEnvFile(resolve(root, ".env"));
}
