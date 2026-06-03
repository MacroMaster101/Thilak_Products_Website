import Link from "next/link";
import { getActiveProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-cream">
        All Products
      </h1>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="rounded-full border border-gold px-4 py-1.5 text-sm text-gold transition duration-200 hover:bg-gold hover:text-bg"
            >
              {category.name}
            </Link>
          ))}
        </div>
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
          <p className="mt-4 font-display text-xl text-cream">
            Our shelves are being restocked
          </p>
          <p className="mt-2 text-muted">
            New handmade wicks are on their way. Please check back soon.
          </p>
        </div>
      )}
    </main>
  );
}
