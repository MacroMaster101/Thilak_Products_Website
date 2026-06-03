import { defineConfig } from "@prisma/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local (preferred) or .env so that Prisma CLI commands pick up the
// same DATABASE_URL that the Next.js app uses at runtime.
// dotenv is not a listed dependency, so we parse the file manually.
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

const root = resolve(__dirname);
// Prefer .env.local; fall back to .env
if (existsSync(resolve(root, ".env.local"))) {
  loadEnvFile(resolve(root, ".env.local"));
} else {
  loadEnvFile(resolve(root, ".env"));
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
