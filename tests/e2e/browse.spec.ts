// Load env FIRST so @/lib/prisma can read DATABASE_URL at import time.
import "./_env";

import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";

const SLUG = "e2e-browse-wick";

test.beforeAll(async () => {
  const category = await prisma.category.findFirst();
  if (!category) {
    throw new Error("No seeded category found — cannot run browse e2e tests");
  }

  // Remove any stale product from a previous run.
  await prisma.product.deleteMany({ where: { slug: SLUG } });

  await prisma.product.create({
    data: {
      slug: SLUG,
      name: "E2E Browse Wick",
      description: "desc",
      basePrice: 75,
      isActive: true,
      isFeatured: false,
      images: [],
      categoryId: category.id,
    },
  });
});

test.afterAll(async () => {
  await prisma.product.deleteMany({ where: { slug: SLUG } });
  await prisma.$disconnect();
});

test("homepage shows shop-by-type categories", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Shop by Type")).toBeVisible();
  await expect(
    page.locator('a[href="/category/cotton-wick"]').first()
  ).toBeVisible();
});

test("product page WhatsApp link is pre-filled", async ({ page }) => {
  await page.goto(`/product/${SLUG}`);
  await expect(page.getByText("E2E Browse Wick").first()).toBeVisible();

  const link = page.getByRole("link", { name: "Order on WhatsApp" });
  const href = await link.getAttribute("href");
  expect(href).toContain("https://wa.me/");
  expect(href).toContain("text=");
});
