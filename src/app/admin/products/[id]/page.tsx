import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/site/ProductForm";
import { updateProduct, deleteProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { displayOrder: "asc" } } },
    }),
    getCategories(),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);
  const deleteWithId = deleteProduct.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-cream">
        Edit product
      </h1>
      <div className="mt-8">
        <ProductForm
          action={updateWithId}
          deleteAction={deleteWithId}
          categories={categories}
          initial={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            categoryId: product.categoryId,
            basePrice: product.basePrice,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            images: product.images,
            variants: product.variants.map((v) => ({
              label: v.label,
              price: v.price,
            })),
          }}
        />
      </div>
    </main>
  );
}
