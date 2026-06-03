import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env.local (preferred) or .env so that DATABASE_URL is available when
// this script is run via `tsx` (which does not auto-load .env files).
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

const root = resolve(__dirname, "..");
if (existsSync(resolve(root, ".env.local"))) {
  loadEnvFile(resolve(root, ".env.local"));
} else {
  loadEnvFile(resolve(root, ".env"));
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { slug: "cotton-wick", name: "Cotton Wick", displayOrder: 1, description: "Pure cotton wicks for everyday lamps." },
  { slug: "oil-lamp-wick", name: "Oil Lamp Wick", displayOrder: 2, description: "Long, steady-burning wicks for oil lamps." },
  { slug: "floating-wick", name: "Floating Wick", displayOrder: 3, description: "Floating wicks for water bowls and decorative lamps." },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log("Seeded categories");
}

main().finally(() => prisma.$disconnect());
