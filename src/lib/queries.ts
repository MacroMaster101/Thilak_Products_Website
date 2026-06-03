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
