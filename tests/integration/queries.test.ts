import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCategories, getProductBySlug, getFeaturedProducts } from "@/lib/queries";

beforeAll(async () => {
  await prisma.product.deleteMany({ where: { slug: "test-cotton-wick" } });
  const cat = await prisma.category.findFirstOrThrow();
  await prisma.product.create({
    data: {
      slug: "test-cotton-wick", name: "Test Cotton Wick", description: "desc",
      basePrice: 60, isFeatured: true, isActive: true, categoryId: cat.id,
    },
  });
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
