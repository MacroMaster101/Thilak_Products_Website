import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/site/ProductForm";
import { createProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireUser();
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-cream">
        New product
      </h1>
      <div className="mt-8">
        <ProductForm action={createProduct} categories={categories} />
      </div>
    </main>
  );
}
