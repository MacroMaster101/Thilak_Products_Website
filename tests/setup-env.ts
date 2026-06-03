import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Vitest does not auto-load .env files. This setup file populates process.env
// from .env.local (preferred) or .env before any test module imports modules
// such as @/lib/prisma that read DATABASE_URL at import time.
// dotenv is not a listed dependency, so we parse the file manually (matching
// the loader style used in prisma.config.ts).
function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf-8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Skip blank lines and comments
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Strip surrounding single or double quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Only set if not already present in the environment
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const root = resolve(__dirname, "..");
// Prefer .env.local; fall back to .env
if (existsSync(resolve(root, ".env.local"))) {
  loadEnvFile(resolve(root, ".env.local"));
} else {
  loadEnvFile(resolve(root, ".env"));
}
