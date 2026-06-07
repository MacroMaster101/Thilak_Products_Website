"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";

async function parseProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const description = String(formData.get("description") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");

  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  const basePrice = basePriceRaw === "" ? null : Number(basePriceRaw);

  const isFeatured = formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "on";

  const labels = formData.getAll("variantLabel").map((v) => String(v));
  const prices = formData.getAll("variantPrice").map((v) => String(v));
  const variants = labels
    .map((label, i) => ({
      label: label.trim(),
      price: Number(prices[i] ?? 0),
      displayOrder: i,
    }))
    .filter((v) => v.label !== "")
    .map((v, i) => ({ ...v, displayOrder: i }));

  const existingImages = formData
    .getAll("existingImage")
    .map((v) => String(v));

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded: string[] = [];
  for (const file of files) {
    uploaded.push(await uploadProductImage(file));
  }

  const images = [...existingImages, ...uploaded];

  return productSchema.parse({
    name,
    slug,
    description,
    categoryId,
    basePrice,
    images,
    isFeatured,
    isActive,
    variants,
  });
}

export async function createProduct(formData: FormData) {
  await requireUser();
  const parsed = await parseProductForm(formData);

  await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      categoryId: parsed.categoryId,
      basePrice: parsed.basePrice,
      images: parsed.images,
      isFeatured: parsed.isFeatured,
      isActive: parsed.isActive,
      variants: { create: parsed.variants },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireUser();
  const parsed = await parseProductForm(formData);

  // Note: orphaned images from removed URLs are left in the bucket on update
  // (acceptable for v1); images are cleaned up only on product delete.
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        categoryId: parsed.categoryId,
        basePrice: parsed.basePrice,
        images: parsed.images,
        isFeatured: parsed.isFeatured,
        isActive: parsed.isActive,
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

  const product = await prisma.product.findUnique({
    where: { id },
    select: { images: true },
  });

  await prisma.product.delete({ where: { id } });

  if (product) {
    for (const url of product.images) {
      try {
        await deleteProductImage(url.split("?")[0]);
      } catch {
        // Ignore bucket cleanup failures.
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
