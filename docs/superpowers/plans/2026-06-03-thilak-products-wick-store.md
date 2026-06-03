# Thilak Products Wick Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a catalog + inquiry website for Thilak Products (cotton, oil lamp, and floating wicks) where customers browse products and contact the store via WhatsApp/phone/form/email, with a login-protected admin panel for product management.

**Architecture:** A single Next.js 15 (App Router, TypeScript) app with three surfaces — public catalog, Supabase-Auth-protected admin, and a contact API route. Supabase provides Postgres, Auth, and Storage; Prisma owns the schema and migrations against the Supabase Postgres connection string; the Supabase client is used only for auth and file uploads. No cart/checkout in v1.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Supabase (Postgres + Auth + Storage), Resend, Vitest, Playwright. Currency: Sri Lankan Rupee (Rs). Warm/traditional visual theme.

---

## File Structure

```
prisma/
  schema.prisma            # Category, Product, ProductVariant, ContactInquiry
  seed.ts                  # seeds the three categories
src/
  lib/
    env.ts                 # validated env vars (fail fast)
    prisma.ts              # Prisma client singleton
    supabase/
      client.ts            # browser Supabase client
      server.ts            # server Supabase client (cookies)
    pricing.ts             # displayPrice(product) -> "Rs X" | "from Rs X"
    whatsapp.ts            # buildWhatsAppLink(number, productName)
    validation.ts          # Zod schemas (contact form, product form)
    queries.ts             # product/category read queries (Prisma)
    storage.ts             # Supabase Storage upload/delete helpers
    config.ts              # store contact info from env (number, phone, email, address)
  components/
    ui/                    # shadcn components
    site/                  # Header, Footer, ProductCard, ContactButtons, CategoryNav
  app/
    layout.tsx, globals.css, not-found.tsx
    page.tsx               # homepage
    products/page.tsx
    category/[slug]/page.tsx
    product/[slug]/page.tsx
    about/page.tsx
    contact/page.tsx
    api/contact/route.ts   # POST contact inquiry -> Resend + DB
    admin/
      layout.tsx           # auth guard
      login/page.tsx
      page.tsx             # product list
      products/new/page.tsx
      products/[id]/page.tsx
      actions.ts           # server actions: create/update/delete/toggle
tests/
  unit/pricing.test.ts, whatsapp.test.ts, validation.test.ts
  integration/queries.test.ts, contact-api.test.ts
  e2e/browse.spec.ts, admin.spec.ts, contact.spec.ts
```

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Scaffold app**

Run in the project root (it already contains `.git`, `README.md`, `docs/`):
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
When prompted that the directory is not empty, choose to continue (it keeps existing files).

- [ ] **Step 2: Verify dev server boots**

Run: `npm run dev` then open http://localhost:3000
Expected: default Next.js page loads. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 app with TypeScript and Tailwind"
```

---

## Task 2: Install dependencies and tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `playwright.config.ts`

- [ ] **Step 1: Install runtime + dev dependencies**

```bash
npm install @prisma/client @supabase/supabase-js @supabase/ssr zod resend
npm install -D prisma vitest @vitejs/plugin-react vite-tsconfig-paths @playwright/test tsx
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Create Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Create Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

- [ ] **Step 4: Add scripts to package.json**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"db:migrate": "prisma migrate dev",
"db:seed": "tsx prisma/seed.ts",
"db:generate": "prisma generate"
```

- [ ] **Step 5: Verify Vitest runs (no tests yet)**

Run: `npm test`
Expected: exits 0 with "No test files found" (acceptable) — or passes if any exist.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Prisma, Supabase, Zod, Resend, Vitest, Playwright"
```

---

## Task 3: Environment validation (fail fast)

**Files:**
- Create: `src/lib/env.ts`, `.env.example`, `tests/unit/env.test.ts`
- Create: `.env.local` (local, gitignored)

- [ ] **Step 1: Write the failing test**

Create `tests/unit/env.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("throws when a required var is missing", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("returns typed config when all vars present", () => {
    const env = parseEnv({
      DATABASE_URL: "postgres://x",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      RESEND_API_KEY: "re_x",
      CONTACT_EMAIL_TO: "store@example.com",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "94770000000",
      NEXT_PUBLIC_STORE_PHONE: "+94770000000",
      NEXT_PUBLIC_STORE_EMAIL: "store@example.com",
      NEXT_PUBLIC_STORE_ADDRESS: "Colombo",
    });
    expect(env.DATABASE_URL).toBe("postgres://x");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- env`
Expected: FAIL — cannot find module `@/lib/env`.

- [ ] **Step 3: Implement env parser**

Create `src/lib/env.ts`:
```ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CONTACT_EMAIL_TO: z.string().email(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(1),
  NEXT_PUBLIC_STORE_PHONE: z.string().min(1),
  NEXT_PUBLIC_STORE_EMAIL: z.string().email(),
  NEXT_PUBLIC_STORE_ADDRESS: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid/missing environment variables: ${missing}`);
  }
  return result.data;
}

export const env = parseEnv(process.env);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- env`
Expected: PASS (2 tests).

- [ ] **Step 5: Create .env.example and .env.local with random placeholders**

Create `.env.example`:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
RESEND_API_KEY="re_your_key"
CONTACT_EMAIL_TO="orders@thilakproducts.lk"
NEXT_PUBLIC_WHATSAPP_NUMBER="94770000000"
NEXT_PUBLIC_STORE_PHONE="+94 77 000 0000"
NEXT_PUBLIC_STORE_EMAIL="orders@thilakproducts.lk"
NEXT_PUBLIC_STORE_ADDRESS="No. 123, Main Street, Colombo, Sri Lanka"
```
Copy it to `.env.local` and keep the same placeholder values for now (random per user instruction). Confirm `.env*.local` is in `.gitignore` (create-next-app adds it).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add fail-fast environment validation"
```

---

## Task 4: Prisma schema and client

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma/seed.ts`

- [ ] **Step 1: Write the schema**

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id           String    @id @default(cuid())
  slug         String    @unique
  name         String
  description  String?
  displayOrder Int       @default(0)
  products     Product[]
}

model Product {
  id          String           @id @default(cuid())
  slug        String           @unique
  name        String
  description String
  basePrice   Int?             // in Rs; null when product uses variants
  images      String[]         @default([])
  isFeatured  Boolean          @default(false)
  isActive    Boolean          @default(true)
  categoryId  String
  category    Category         @relation(fields: [categoryId], references: [id])
  variants    ProductVariant[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model ProductVariant {
  id           String  @id @default(cuid())
  productId    String
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  label        String
  price        Int     // in Rs
  displayOrder Int     @default(0)
}

model ContactInquiry {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  productName String?
  message     String
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 2: Create Prisma client singleton**

Create `src/lib/prisma.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Create seed script**

Create `prisma/seed.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "cotton-wick", name: "Cotton Wick", displayOrder: 1,
    description: "Pure cotton wicks for everyday lamps." },
  { slug: "oil-lamp-wick", name: "Oil Lamp Wick", displayOrder: 2,
    description: "Long, steady-burning wicks for oil lamps." },
  { slug: "floating-wick", name: "Floating Wick", displayOrder: 3,
    description: "Floating wicks for water bowls and decorative lamps." },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log("Seeded categories");
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 4: Generate client and run migration**

Run (requires a real `DATABASE_URL` in `.env.local` pointing at Supabase; if not yet provisioned, the engineer should create a free Supabase project first):
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```
Expected: migration applied, "Seeded categories" printed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema, client, and category seed"
```

---

## Task 5: Pricing logic (unit)

**Files:**
- Create: `src/lib/pricing.ts`, `tests/unit/pricing.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/pricing.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { displayPrice, formatRs } from "@/lib/pricing";

describe("formatRs", () => {
  it("formats with Rs prefix and thousands separators", () => {
    expect(formatRs(1500)).toBe("Rs 1,500");
  });
});

describe("displayPrice", () => {
  it("uses base price when no variants", () => {
    expect(displayPrice({ basePrice: 60, variants: [] })).toBe("Rs 60");
  });

  it("shows 'from' lowest variant when variants exist", () => {
    expect(
      displayPrice({ basePrice: null, variants: [{ price: 120 }, { price: 50 }, { price: 80 }] })
    ).toBe("from Rs 50");
  });

  it("returns 'Price on request' when neither base nor variants", () => {
    expect(displayPrice({ basePrice: null, variants: [] })).toBe("Price on request");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- pricing`
Expected: FAIL — cannot find module `@/lib/pricing`.

- [ ] **Step 3: Implement pricing**

Create `src/lib/pricing.ts`:
```ts
export function formatRs(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

type PriceInput = {
  basePrice: number | null;
  variants: { price: number }[];
};

export function displayPrice({ basePrice, variants }: PriceInput): string {
  if (variants.length > 0) {
    const lowest = Math.min(...variants.map((v) => v.price));
    return `from ${formatRs(lowest)}`;
  }
  if (basePrice != null) return formatRs(basePrice);
  return "Price on request";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- pricing`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pricing display logic"
```

---

## Task 6: WhatsApp link builder (unit)

**Files:**
- Create: `src/lib/whatsapp.ts`, `tests/unit/whatsapp.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/whatsapp.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildWhatsAppLink } from "@/lib/whatsapp";

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with url-encoded prefilled product message", () => {
    const link = buildWhatsAppLink("94770000000", "Cotton Wick (Medium)");
    expect(link).toBe(
      "https://wa.me/94770000000?text=Hi%2C%20I%27m%20interested%20in%3A%20Cotton%20Wick%20(Medium)"
    );
  });

  it("strips non-digits from the number", () => {
    const link = buildWhatsAppLink("+94 77 000 0000", "Floating Wick");
    expect(link.startsWith("https://wa.me/94770000000?")).toBe(true);
  });

  it("uses a generic message when no product is given", () => {
    const link = buildWhatsAppLink("94770000000");
    expect(decodeURIComponent(link)).toContain("Hi, I'd like to ask about your wicks");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- whatsapp`
Expected: FAIL — cannot find module `@/lib/whatsapp`.

- [ ] **Step 3: Implement builder**

Create `src/lib/whatsapp.ts`:
```ts
export function buildWhatsAppLink(rawNumber: string, productName?: string): string {
  const number = rawNumber.replace(/\D/g, "");
  const message = productName
    ? `Hi, I'm interested in: ${productName}`
    : "Hi, I'd like to ask about your wicks";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- whatsapp`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add WhatsApp link builder"
```

---

## Task 7: Validation schemas (unit)

**Files:**
- Create: `src/lib/validation.ts`, `tests/unit/validation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/validation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { contactSchema, productSchema } from "@/lib/validation";

describe("contactSchema", () => {
  it("accepts a valid inquiry", () => {
    const r = contactSchema.safeParse({
      name: "Asha", email: "a@b.com", message: "Do you ship to Kandy?",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const r = contactSchema.safeParse({ name: "Asha", email: "nope", message: "hi there" });
    expect(r.success).toBe(false);
  });

  it("rejects too-short message", () => {
    const r = contactSchema.safeParse({ name: "Asha", email: "a@b.com", message: "hi" });
    expect(r.success).toBe(false);
  });
});

describe("productSchema", () => {
  it("accepts a product with variants and null basePrice", () => {
    const r = productSchema.safeParse({
      name: "Cotton Wick", slug: "cotton-wick", description: "Pure cotton.",
      categoryId: "cat1", basePrice: null, isFeatured: true, isActive: true,
      variants: [{ label: "Small", price: 50, displayOrder: 0 }],
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative price", () => {
    const r = productSchema.safeParse({
      name: "X", slug: "x", description: "desc here", categoryId: "c",
      basePrice: -5, isFeatured: false, isActive: true, variants: [],
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- validation`
Expected: FAIL — cannot find module `@/lib/validation`.

- [ ] **Step 3: Implement schemas**

Create `src/lib/validation.ts`:
```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  productName: z.string().optional(),
  message: z.string().min(5, "Message is too short"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const variantSchema = z.object({
  label: z.string().min(1),
  price: z.number().int().nonnegative(),
  displayOrder: z.number().int().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, dashes only"),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  basePrice: z.number().int().nonnegative().nullable(),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- validation`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add contact and product Zod schemas"
```

---

## Task 8: Config + Supabase clients

**Files:**
- Create: `src/lib/config.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`

- [ ] **Step 1: Implement store config helper**

Create `src/lib/config.ts`:
```ts
export const storeConfig = {
  name: "Thilak Products",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
};
```

- [ ] **Step 2: Implement browser Supabase client**

Create `src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Implement server Supabase client**

Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component; safe to ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add store config and Supabase browser/server clients"
```

---

## Task 9: Read queries (integration)

**Files:**
- Create: `src/lib/queries.ts`, `tests/integration/queries.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/integration/queries.test.ts` (runs against the seeded dev DB; requires `DATABASE_URL`):
```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCategories, getProductBySlug, getFeaturedProducts } from "@/lib/queries";

let createdId: string;

beforeAll(async () => {
  const cat = await prisma.category.findFirstOrThrow();
  const p = await prisma.product.create({
    data: {
      slug: "test-cotton-wick", name: "Test Cotton Wick", description: "desc",
      basePrice: 60, isFeatured: true, isActive: true, categoryId: cat.id,
    },
  });
  createdId = p.id;
});

afterAll(async () => {
  await prisma.product.deleteMany({ where: { slug: "test-cotton-wick" } });
  await prisma.$disconnect();
});

describe("queries", () => {
  it("getCategories returns the seeded categories ordered", async () => {
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThanOrEqual(3);
    expect(cats[0].displayOrder).toBeLessThanOrEqual(cats[1].displayOrder);
  });

  it("getProductBySlug returns product with variants and category", async () => {
    const p = await getProductBySlug("test-cotton-wick");
    expect(p?.name).toBe("Test Cotton Wick");
    expect(p?.category).toBeTruthy();
  });

  it("getFeaturedProducts only returns active+featured", async () => {
    const featured = await getFeaturedProducts();
    expect(featured.every((p) => p.isFeatured && p.isActive)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- queries`
Expected: FAIL — cannot find module `@/lib/queries`.

- [ ] **Step 3: Implement queries**

Create `src/lib/queries.ts`:
```ts
import { prisma } from "@/lib/prisma";

const productInclude = {
  variants: { orderBy: { displayOrder: "asc" as const } },
  category: true,
};

export function getCategories() {
  return prisma.category.findMany({ orderBy: { displayOrder: "asc" } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: productInclude });
}

export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: productInclude,
    take: 6,
  });
}

export function getActiveProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- queries`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add product and category read queries"
```

---

## Task 10: Theme, layout shell, Header & Footer

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`
- Create: `src/components/site/Header.tsx`, `src/components/site/Footer.tsx`, `src/components/site/ContactButtons.tsx`

- [ ] **Step 1: Define theme tokens in globals.css**

In `src/app/globals.css`, after the Tailwind directives, add CSS variables for the warm palette and a serif display font:
```css
:root {
  --color-bg: #1c0f08;
  --color-surface: #2b1810;
  --color-surface-2: #3a2113;
  --color-gold: #c9821f;
  --color-cream: #f3d9a6;
  --color-muted: #cbb189;
  --color-whatsapp: #25d366;
}
body {
  background: var(--color-bg);
  color: var(--color-cream);
}
.font-display { font-family: Georgia, "Times New Roman", serif; }
```

- [ ] **Step 2: Map tokens in Tailwind config**

In `tailwind.config.ts` `theme.extend.colors`, add:
```ts
colors: {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  surface2: "var(--color-surface-2)",
  gold: "var(--color-gold)",
  cream: "var(--color-cream)",
  muted: "var(--color-muted)",
  whatsapp: "var(--color-whatsapp)",
}
```

- [ ] **Step 3: ContactButtons component**

Create `src/components/site/ContactButtons.tsx`:
```tsx
import { storeConfig } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function ContactButtons({ productName }: { productName?: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={buildWhatsAppLink(storeConfig.whatsappNumber, productName)}
        target="_blank" rel="noopener noreferrer"
        className="rounded-md bg-whatsapp px-4 py-2 text-sm font-medium text-emerald-950"
      >
        Order on WhatsApp
      </a>
      <a href={`tel:${storeConfig.phone}`}
        className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-bg">
        Call
      </a>
      <a href={`mailto:${storeConfig.email}`}
        className="rounded-md border border-gold px-4 py-2 text-sm text-cream">
        Email
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Header component**

Create `src/components/site/Header.tsx`:
```tsx
import Link from "next/link";
import { storeConfig } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Header() {
  return (
    <header className="flex items-center justify-between bg-surface px-5 py-3">
      <Link href="/" className="font-display text-lg tracking-wide text-cream">
        🪔 {storeConfig.name}
      </Link>
      <nav className="hidden gap-4 text-sm text-muted md:flex">
        <Link href="/products">Shop</Link>
        <Link href="/category/cotton-wick">Cotton</Link>
        <Link href="/category/oil-lamp-wick">Oil Lamp</Link>
        <Link href="/category/floating-wick">Floating</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <a href={buildWhatsAppLink(storeConfig.whatsappNumber)} target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-whatsapp px-3 py-1.5 text-xs font-medium text-emerald-950">
        WhatsApp
      </a>
    </header>
  );
}
```

- [ ] **Step 5: Footer component**

Create `src/components/site/Footer.tsx`:
```tsx
import Link from "next/link";
import { storeConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-[#160b05] px-5 py-6 text-center text-xs text-muted">
      <div>{storeConfig.name} · © {new Date().getFullYear()}</div>
      <div className="mt-2 flex justify-center gap-3">
        <Link href="/products">Shop</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/about">About</Link>
      </div>
      <div className="mt-2">{storeConfig.address}</div>
    </footer>
  );
}
```

- [ ] **Step 6: Wire layout**

Replace `src/app/layout.tsx` body so it renders Header, children, Footer:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Thilak Products — Cotton, Oil Lamp & Floating Wicks",
  description: "Handmade pure cotton wicks for oil lamps, diyas, and floating bowls.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify build/type-check**

Run: `npx tsc --noEmit && npm run dev` then open http://localhost:3000 — header and footer render in warm theme. Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add warm theme, header, footer, contact buttons"
```

---

## Task 11: ProductCard component

**Files:**
- Create: `src/components/site/ProductCard.tsx`

- [ ] **Step 1: Implement ProductCard**

Create `src/components/site/ProductCard.tsx`:
```tsx
import Link from "next/link";
import { displayPrice } from "@/lib/pricing";

type CardProduct = {
  slug: string;
  name: string;
  images: string[];
  basePrice: number | null;
  variants: { price: number }[];
};

export function ProductCard({ product }: { product: CardProduct }) {
  return (
    <Link href={`/product/${product.slug}`}
      className="block overflow-hidden rounded-lg bg-surface">
      <div className="h-40 bg-surface2">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name}
            className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-cream">{product.name}</div>
        <div className="mt-1 text-sm text-gold">{displayPrice(product)}</div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ProductCard component"
```

---

## Task 12: Homepage

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: Implement homepage**

Replace `src/app/page.tsx`:
```tsx
import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { ContactButtons } from "@/components/site/ContactButtons";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-[#9c5a16] px-5 py-16 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_50%_35%,#fff3c4,#ff7a18_75%,transparent)] shadow-[0_0_34px_10px_rgba(255,150,40,.5)]" />
        <h1 className="font-display text-3xl text-cream">Pure Cotton Wicks for Every Lamp</h1>
        <p className="mt-2 text-sm text-muted">Handmade · Cotton, Oil Lamp &amp; Floating wicks</p>
        <Link href="/products"
          className="mt-5 inline-block rounded-md bg-gold px-5 py-2 text-sm text-bg">
          Browse Products
        </Link>
      </section>

      {/* Shop by type */}
      <section className="bg-[#241410] px-5 py-8">
        <h2 className="mb-4 text-center font-display text-cream">Shop by Type</h2>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`}
              className="rounded-lg bg-surface2 p-6 text-center text-sm text-cream">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="px-5 py-8">
          <h2 className="mb-4 text-center font-display text-cream">Featured Products</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Why our wicks */}
      <section className="bg-[#241410] px-5 py-8 text-center text-sm text-muted">
        <h2 className="mb-3 font-display text-cream">Why our wicks</h2>
        <p>🌿 100% cotton · 🔥 Long, steady burn · 🤲 Handmade</p>
      </section>

      {/* Contact band */}
      <section className="bg-gradient-to-b from-[#5a2e16] to-surface px-5 py-10 text-center">
        <h2 className="font-display text-xl text-cream">Have a question or bulk order?</h2>
        <p className="mb-4 mt-1 text-sm text-muted">Reach us any way you like</p>
        <div className="flex justify-center"><ContactButtons /></div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, open http://localhost:3000 — hero, three category cards, featured grid (if seeded data has featured products), contact band all render. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add homepage"
```

---

## Task 13: Products + Category listing pages

**Files:**
- Create: `src/app/products/page.tsx`, `src/app/category/[slug]/page.tsx`

- [ ] **Step 1: All products page**

Create `src/app/products/page.tsx`:
```tsx
import { getActiveProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import Link from "next/link";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);
  return (
    <div className="px-5 py-8">
      <h1 className="mb-4 font-display text-2xl text-cream">All Products</h1>
      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`}
            className="rounded border border-gold px-3 py-1 text-cream">
            {c.name}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Category page**

Create `src/app/category/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getActiveProducts, getCategoryBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";

export default async function CategoryPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getActiveProducts(slug);

  return (
    <div className="px-5 py-8">
      <h1 className="font-display text-2xl text-cream">{category.name}</h1>
      {category.description && (
        <p className="mb-5 mt-1 text-sm text-muted">{category.description}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {products.length === 0 && (
        <p className="text-sm text-muted">No products in this category yet.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `/products` and `/category/cotton-wick`. A bad slug like `/category/nope` shows the 404. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add products and category listing pages"
```

---

## Task 14: Product detail page

**Files:**
- Create: `src/app/product/[slug]/page.tsx`

- [ ] **Step 1: Implement detail page**

Create `src/app/product/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/queries";
import { formatRs, displayPrice } from "@/lib/pricing";
import { ContactButtons } from "@/components/site/ContactButtons";

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-72 overflow-hidden rounded-lg bg-surface2">
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name}
                className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex gap-2">
            {product.images.slice(1).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="h-16 w-16 rounded object-cover" />
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl text-cream">{product.name}</h1>
          <p className="mt-1 text-lg text-gold">{displayPrice(product)}</p>
          <p className="mt-3 whitespace-pre-line text-sm text-muted">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 text-sm uppercase tracking-wide text-muted">Sizes</h2>
              <ul className="space-y-1 text-sm text-cream">
                {product.variants.map((v) => (
                  <li key={v.id} className="flex justify-between border-b border-surface2 py-1">
                    <span>{v.label}</span><span className="text-gold">{formatRs(v.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <ContactButtons productName={product.name} />
          </div>
          <Link href={`/contact?product=${encodeURIComponent(product.name)}`}
            className="mt-3 inline-block text-sm text-muted underline">
            Ask about this product
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`. Visit a seeded/created product (e.g. create one in DB or via admin later). Confirm WhatsApp button pre-fills the product name and variants list shows. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add product detail page"
```

---

## Task 15: Themed 404 page

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Implement not-found**

Create `src/app/not-found.tsx`:
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-cream">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="mt-5 inline-block rounded bg-gold px-4 py-2 text-sm text-bg">
        Back home
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify & commit**

Run: `npm run dev`, visit `/nonexistent` → themed 404. Ctrl+C.
```bash
git add -A
git commit -m "feat: add themed 404 page"
```

---

## Task 16: Contact API route (integration)

**Files:**
- Create: `src/app/api/contact/route.ts`, `tests/integration/contact-api.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/integration/contact-api.test.ts`. It mocks Resend so no real email is sent, and verifies the inquiry is persisted:
```ts
import { describe, it, expect, vi, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn().mockResolvedValue({ data: { id: "mock" }, error: null }) };
  },
}));

import { POST } from "@/app/api/contact/route";

afterAll(async () => {
  await prisma.contactInquiry.deleteMany({ where: { email: "test-api@example.com" } });
  await prisma.$disconnect();
});

function req(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  it("rejects invalid input with 400", async () => {
    const res = await POST(req({ name: "", email: "bad", message: "hi" }));
    expect(res.status).toBe(400);
  });

  it("saves a valid inquiry and returns 200", async () => {
    const res = await POST(req({
      name: "API Tester", email: "test-api@example.com",
      message: "Do you deliver to Galle?", productName: "Cotton Wick",
    }));
    expect(res.status).toBe(200);
    const saved = await prisma.contactInquiry.findFirst({
      where: { email: "test-api@example.com" },
    });
    expect(saved?.productName).toBe("Cotton Wick");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- contact-api`
Expected: FAIL — cannot find module `@/app/api/contact/route`.

- [ ] **Step 3: Implement the route**

Create `src/app/api/contact/route.ts`:
```ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Always persist first so we keep a record even if email fails.
  await prisma.contactInquiry.create({
    data: {
      name: data.name, email: data.email, phone: data.phone,
      productName: data.productName, message: data.message,
    },
  });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Thilak Products <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL_TO!,
      subject: `New inquiry from ${data.name}${data.productName ? ` — ${data.productName}` : ""}`,
      replyTo: data.email,
      text: [
        `Name: ${data.name}`, `Email: ${data.email}`,
        `Phone: ${data.phone ?? "-"}`, `Product: ${data.productName ?? "-"}`,
        "", data.message,
      ].join("\n"),
    });
  } catch {
    // Email failed but inquiry is saved; still report success to the user.
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- contact-api`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add contact API route with persist-then-email"
```

---

## Task 17: Contact page + form

**Files:**
- Create: `src/app/contact/page.tsx`, `src/components/site/ContactForm.tsx`

- [ ] **Step 1: ContactForm (client component)**

Create `src/components/site/ContactForm.tsx`:
```tsx
"use client";
import { useState } from "react";

export function ContactForm({ defaultProduct }: { defaultProduct?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/contact", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatus("ok");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors(data?.issues?.fieldErrors ?? {});
      setStatus("error");
    }
  }

  if (status === "ok") {
    return <p className="text-cream">Thank you — we’ve received your message and will reply soon.</p>;
  }

  const field = "w-full rounded bg-surface2 px-3 py-2 text-sm text-cream";
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <input name="name" placeholder="Your name" className={field} />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name[0]}</p>}
      </div>
      <div>
        <input name="email" placeholder="Email" className={field} />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email[0]}</p>}
      </div>
      <input name="phone" placeholder="Phone (optional)" className={field} />
      <input name="productName" defaultValue={defaultProduct ?? ""}
        placeholder="Product (optional)" className={field} />
      <div>
        <textarea name="message" placeholder="Your message" rows={4} className={field} />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message[0]}</p>}
      </div>
      <button type="submit" disabled={status === "sending"}
        className="rounded bg-gold px-4 py-2 text-sm text-bg disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && Object.keys(errors).length === 0 && (
        <p className="text-xs text-red-400">Something went wrong. Please try WhatsApp.</p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Contact page**

Create `src/app/contact/page.tsx`:
```tsx
import { ContactForm } from "@/components/site/ContactForm";
import { ContactButtons } from "@/components/site/ContactButtons";
import { storeConfig } from "@/lib/config";

export default async function ContactPage({
  searchParams,
}: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-display text-2xl text-cream">Contact Us</h1>
      <p className="mt-1 text-sm text-muted">{storeConfig.address}</p>
      <div className="mt-5"><ContactButtons productName={product} /></div>
      <div className="mt-8"><ContactForm defaultProduct={product} /></div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `/contact`, submit with a short message → inline error; submit valid → "Thank you" and a row appears in `ContactInquiry` (check Supabase table). Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add contact page and form"
```

---

## Task 18: About page

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Implement About**

Create `src/app/about/page.tsx`:
```tsx
import { storeConfig } from "@/lib/config";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-2xl text-cream">About {storeConfig.name}</h1>
      <p className="mt-3 text-sm text-muted">
        {storeConfig.name} makes pure cotton wicks for oil lamps, diyas, and floating
        bowls. Each wick is handmade for a long, steady, clean burn — crafted for daily
        prayer and festival lighting.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify & commit**

Run: `npm run dev`, open `/about`. Ctrl+C.
```bash
git add -A
git commit -m "feat: add about page"
```

---

## Task 19: Supabase Storage upload helper

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 1: Implement upload/delete helpers**

Create `src/lib/storage.ts`. Uses the service-role client server-side to upload to a `product-images` bucket (create this public bucket in the Supabase dashboard). Enforces type/size limits.
```ts
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Unsupported image type");
  if (file.size > MAX_BYTES) throw new Error("Image exceeds 5 MB");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await admin().storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = admin().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await admin().storage.from(BUCKET).remove([path]);
}
```

- [ ] **Step 2: Type-check & commit**

Run: `npx tsc --noEmit`
```bash
git add -A
git commit -m "feat: add Supabase Storage image upload helper"
```

---

## Task 20: Admin auth guard + login

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`, `src/app/admin/logout/route.ts`

- [ ] **Step 1: Admin layout guard (server-side check on every admin route)**

Create `src/app/admin/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  // Allow the login page itself to render without a session.
  if (!data.user) {
    // The login page is /admin/login; it renders its own minimal UI below.
    return <div className="min-h-screen">{children}</div>;
  }
  return (
    <div className="min-h-screen">
      <div className="flex justify-between bg-surface px-5 py-3 text-sm text-cream">
        <Link href="/admin">Admin · Products</Link>
        <form action="/admin/logout" method="post">
          <button className="text-muted">Sign out</button>
        </form>
      </div>
      {children}
    </div>
  );
}
```

Note: the per-page guard in Step-following tasks (`requireUser`) is the real protection; this layout only renders chrome. Create `src/lib/auth.ts` helper:
```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return data.user;
}
```
(Place this in `src/lib/auth.ts`.)

- [ ] **Step 2: Login action**

Create `src/app/admin/login/actions.ts`:
```ts
"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password" };
  redirect("/admin");
}
```

- [ ] **Step 3: Login page**

Create `src/app/admin/login/page.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);
  const field = "w-full rounded bg-surface2 px-3 py-2 text-sm text-cream";
  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="mb-4 font-display text-2xl text-cream">Admin Login</h1>
      <form action={formAction} className="space-y-3">
        <input name="email" type="email" placeholder="Email" className={field} />
        <input name="password" type="password" placeholder="Password" className={field} />
        <button disabled={pending}
          className="rounded bg-gold px-4 py-2 text-sm text-bg disabled:opacity-60">
          {pending ? "Signing in…" : "Sign in"}
        </button>
        {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Logout route**

Create `src/app/admin/logout/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
```

- [ ] **Step 5: Create an admin user in Supabase**

In the Supabase dashboard → Authentication → Users → Add user, create an email/password admin account. (Disable public sign-ups in Auth settings so only this account exists.)

- [ ] **Step 6: Verify**

Run: `npm run dev`. Visit `/admin` (next task wires the page, but `requireUser` should redirect to `/admin/login` when logged out). Log in → redirected to `/admin`. Sign out works. Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add admin auth guard, login, and logout"
```

---

## Task 21: Admin product list

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Implement admin list**

Create `src/app/admin/page.tsx`:
```tsx
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayPrice } from "@/lib/pricing";

export default async function AdminProductsPage() {
  await requireUser();
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream">Products</h1>
        <Link href="/admin/products/new"
          className="rounded bg-gold px-4 py-2 text-sm text-bg">New product</Link>
      </div>
      <table className="w-full text-sm text-cream">
        <thead className="text-muted">
          <tr><th className="py-2 text-left">Name</th><th>Category</th>
            <th>Price</th><th>Featured</th><th>Active</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-surface2">
              <td className="py-2">{p.name}</td>
              <td className="text-center">{p.category.name}</td>
              <td className="text-center">{displayPrice(p)}</td>
              <td className="text-center">{p.isFeatured ? "★" : "–"}</td>
              <td className="text-center">{p.isActive ? "✓" : "✗"}</td>
              <td className="text-right">
                <Link href={`/admin/products/${p.id}`} className="text-gold">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <p className="mt-4 text-sm text-muted">No products yet. Create your first one.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify & commit**

Run: `npm run dev`, log in, open `/admin` → list renders. Ctrl+C.
```bash
git add -A
git commit -m "feat: add admin product list"
```

---

## Task 22: Admin server actions (create/update/delete/toggle)

**Files:**
- Create: `src/app/admin/actions.ts`

- [ ] **Step 1: Implement actions**

Create `src/app/admin/actions.ts`. Every action calls `requireUser()` first (server-side auth on every mutating action). Image files are uploaded via the storage helper; variants are replaced wholesale on update.
```ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { uploadProductImage } from "@/lib/storage";

function parseForm(formData: FormData) {
  const variants: { label: string; price: number; displayOrder: number }[] = [];
  const labels = formData.getAll("variantLabel").map(String);
  const prices = formData.getAll("variantPrice").map((v) => Number(v));
  labels.forEach((label, i) => {
    if (label.trim()) variants.push({ label, price: prices[i] || 0, displayOrder: i });
  });
  const baseRaw = String(formData.get("basePrice") ?? "");
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    basePrice: baseRaw === "" ? null : Number(baseRaw),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
    variants,
    existingImages: formData.getAll("existingImage").map(String),
  };
}

async function uploadNewImages(formData: FormData): Promise<string[]> {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const f of files) urls.push(await uploadProductImage(f));
  return urls;
}

export async function createProduct(formData: FormData) {
  await requireUser();
  const raw = parseForm(formData);
  const newImages = await uploadNewImages(formData);
  const images = [...raw.existingImages, ...newImages];
  const parsed = productSchema.parse({ ...raw, images });
  await prisma.product.create({
    data: {
      name: parsed.name, slug: parsed.slug, description: parsed.description,
      categoryId: parsed.categoryId, basePrice: parsed.basePrice, images: parsed.images,
      isFeatured: parsed.isFeatured, isActive: parsed.isActive,
      variants: { create: parsed.variants },
    },
  });
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireUser();
  const raw = parseForm(formData);
  const newImages = await uploadNewImages(formData);
  const images = [...raw.existingImages, ...newImages];
  const parsed = productSchema.parse({ ...raw, images });
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: parsed.name, slug: parsed.slug, description: parsed.description,
        categoryId: parsed.categoryId, basePrice: parsed.basePrice, images: parsed.images,
        isFeatured: parsed.isFeatured, isActive: parsed.isActive,
        variants: { create: parsed.variants },
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteProduct(id: string) {
  await requireUser();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}
```

- [ ] **Step 2: Type-check & commit**

Run: `npx tsc --noEmit`
```bash
git add -A
git commit -m "feat: add admin product server actions"
```

---

## Task 23: Admin product form (new + edit)

**Files:**
- Create: `src/components/site/ProductForm.tsx`, `src/app/admin/products/new/page.tsx`, `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: ProductForm component**

Create `src/components/site/ProductForm.tsx`. Variants are editable rows added client-side; on submit the server action reads repeated `variantLabel`/`variantPrice` fields.
```tsx
"use client";
import { useState } from "react";

type Category = { id: string; name: string };
type Variant = { label: string; price: number };
type Initial = {
  name?: string; slug?: string; description?: string; categoryId?: string;
  basePrice?: number | null; isFeatured?: boolean; isActive?: boolean;
  images?: string[]; variants?: Variant[];
};

export function ProductForm({
  action, categories, initial, deleteAction,
}: {
  action: (formData: FormData) => void;
  categories: Category[];
  initial?: Initial;
  deleteAction?: () => void;
}) {
  const [variants, setVariants] = useState<Variant[]>(initial?.variants ?? []);
  const field = "w-full rounded bg-surface2 px-3 py-2 text-sm text-cream";

  return (
    <form action={action} className="space-y-4">
      <input name="name" placeholder="Name" defaultValue={initial?.name} className={field} />
      <input name="slug" placeholder="slug-like-this" defaultValue={initial?.slug} className={field} />
      <textarea name="description" placeholder="Description" rows={4}
        defaultValue={initial?.description} className={field} />
      <select name="categoryId" defaultValue={initial?.categoryId} className={field}>
        <option value="">Select category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input name="basePrice" type="number" placeholder="Base price in Rs (leave blank if using variants)"
        defaultValue={initial?.basePrice ?? ""} className={field} />

      {initial?.images?.map((src) => (
        <label key={src} className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="existingImage" value={src} defaultChecked /> keep
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
        </label>
      ))}
      <input name="images" type="file" multiple accept="image/*" className="text-xs text-muted" />

      <div>
        <div className="mb-2 text-sm text-muted">Variants (optional)</div>
        {variants.map((v, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input name="variantLabel" defaultValue={v.label} placeholder="Label"
              className={field} />
            <input name="variantPrice" type="number" defaultValue={v.price} placeholder="Rs"
              className={field} />
          </div>
        ))}
        <button type="button" onClick={() => setVariants([...variants, { label: "", price: 0 }])}
          className="text-sm text-gold">+ Add variant</button>
      </div>

      <label className="flex items-center gap-2 text-sm text-cream">
        <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} /> Featured
      </label>
      <label className="flex items-center gap-2 text-sm text-cream">
        <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} /> Active
      </label>

      <div className="flex gap-3">
        <button type="submit" className="rounded bg-gold px-4 py-2 text-sm text-bg">Save</button>
        {deleteAction && (
          <button formAction={deleteAction} className="rounded border border-red-400 px-4 py-2 text-sm text-red-400">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
```

- [ ] **Step 2: New product page**

Create `src/app/admin/products/new/page.tsx`:
```tsx
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/site/ProductForm";
import { createProduct } from "../../actions";

export default async function NewProductPage() {
  await requireUser();
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="mb-4 font-display text-2xl text-cream">New Product</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
```

- [ ] **Step 3: Edit product page**

Create `src/app/admin/products/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/site/ProductForm";
import { updateProduct, deleteProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    getCategories(),
  ]);
  if (!product) notFound();

  const update = updateProduct.bind(null, id);
  const del = deleteProduct.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="mb-4 font-display text-2xl text-cream">Edit Product</h1>
      <ProductForm
        action={update}
        deleteAction={del}
        categories={categories}
        initial={{
          name: product.name, slug: product.slug, description: product.description,
          categoryId: product.categoryId, basePrice: product.basePrice,
          isFeatured: product.isFeatured, isActive: product.isActive,
          images: product.images,
          variants: product.variants.map((v) => ({ label: v.label, price: v.price })),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify the full admin flow**

Run: `npm run dev`, log in, create a product (with an image + a variant), mark Featured → it appears on `/` and `/products`. Edit it, then delete it. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add admin product create/edit/delete form"
```

---

## Task 24: E2E tests

**Files:**
- Create: `tests/e2e/browse.spec.ts`, `tests/e2e/contact.spec.ts`, `tests/e2e/admin.spec.ts`

- [ ] **Step 1: Browse + WhatsApp link E2E**

Create `tests/e2e/browse.spec.ts` (assumes at least one active product exists; seed or create one first):
```ts
import { test, expect } from "@playwright/test";

test("homepage shows shop-by-type categories", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Shop by Type")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cotton Wick" })).toBeVisible();
});

test("product page WhatsApp link is pre-filled", async ({ page }) => {
  await page.goto("/products");
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await firstProduct.click();
  const wa = page.getByRole("link", { name: "Order on WhatsApp" });
  const href = await wa.getAttribute("href");
  expect(href).toContain("https://wa.me/");
  expect(href).toContain("text=");
});
```

- [ ] **Step 2: Contact form E2E**

Create `tests/e2e/contact.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("contact form shows validation error then succeeds", async ({ page }) => {
  await page.goto("/contact");
  await page.getByPlaceholder("Your name").fill("E2E Tester");
  await page.getByPlaceholder("Email").fill("e2e@example.com");
  await page.getByPlaceholder("Your message").fill("Hi");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/too short/i)).toBeVisible();

  await page.getByPlaceholder("Your message").fill("Do you deliver to Jaffna?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/received your message/i)).toBeVisible();
});
```

- [ ] **Step 3: Admin flow E2E**

Create `tests/e2e/admin.spec.ts`. Reads admin credentials from env so no secrets are committed:
```ts
import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL/PASSWORD not set");

test("unauthenticated admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin can create a product that appears on the site", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(EMAIL!);
  await page.getByPlaceholder("Password").fill(PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("link", { name: "New product" }).click();
  const slug = `e2e-wick-${Date.now()}`;
  await page.getByPlaceholder("Name").fill("E2E Wick");
  await page.getByPlaceholder("slug-like-this").fill(slug);
  await page.getByPlaceholder("Description").fill("Created by Playwright.");
  await page.getByRole("combobox").selectOption({ index: 1 });
  await page.getByPlaceholder(/Base price/).fill("99");
  await page.getByRole("button", { name: "Save" }).click();

  await page.goto(`/product/${slug}`);
  await expect(page.getByText("E2E Wick")).toBeVisible();
});
```

- [ ] **Step 4: Run E2E**

Run: `npm run test:e2e`
Expected: browse + contact specs PASS; admin spec passes if `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` are set, otherwise skipped.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add browse, contact, and admin E2E tests"
```

---

## Task 25: Full verification + README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the whole suite**

Run:
```bash
npx tsc --noEmit
npm test
npm run test:e2e
npm run build
```
Expected: type-check clean, unit+integration green, E2E green/skipped, production build succeeds.

- [ ] **Step 2: Write README**

Replace `README.md` with setup instructions: prerequisites (Node, a Supabase project), env vars (copy `.env.example` → `.env.local`), `npx prisma migrate dev` + `npm run db:seed`, create the `product-images` public bucket, create an admin user in Supabase Auth, `npm run dev`, and how to run tests. Note deploy target: Vercel + Supabase.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: add setup and run instructions to README"
```

---

## Self-Review Notes

- **Spec coverage:** scope (Tasks 12–18 public, 20–23 admin), tech stack (1–4, 8, 19), data model (4), pages/routes (12–18, 20–23), error handling (404 in 15, fail-fast env in 3, persist-then-email in 16, auth guard in 20/22, upload limits in 19), testing (5–7 unit, 9/16 integration, 24 E2E). All covered.
- **"Mix of both" pricing:** variants optional per product; `displayPrice` handles base vs `from` (Task 5, used in 11/14/21).
- **Supabase/Prisma boundary:** Prisma owns schema/migrations (Task 4); Supabase client only for auth (20) and storage (19) — consistent throughout.
- **Type consistency:** `displayPrice({ basePrice, variants })`, `buildWhatsAppLink(number, productName?)`, `requireUser()`, `uploadProductImage(file)`, `createProduct/updateProduct/deleteProduct` signatures match across all referencing tasks.
