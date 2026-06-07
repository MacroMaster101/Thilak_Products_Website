import { notFound } from "next/navigation";
import { getActiveProducts, getCategoryBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getActiveProducts(slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-cream">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-3 max-w-prose text-muted">{category.description}</p>
      )}

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-lg border border-gold/15 bg-surface p-12 text-center">
          <div className="text-4xl">🪔</div>
          <p className="mt-4 text-muted">No products in this category yet.</p>
        </div>
      )}
    </main>
  );
}
