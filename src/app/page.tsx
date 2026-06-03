import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { ContactButtons } from "@/components/site/ContactButtons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-[#3a1d0c]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
          <div
            className="mb-10 h-16 w-16 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #fff3c4 0%, #f6b73c 35%, #c9821f 70%, transparent 80%)",
              boxShadow:
                "0 0 30px 10px rgba(246, 183, 60, 0.55), 0 0 70px 25px rgba(201, 130, 31, 0.35)",
            }}
            aria-hidden="true"
          />
          <h1 className="font-display text-4xl font-semibold text-cream sm:text-5xl">
            Pure Cotton Wicks for Every Lamp
          </h1>
          <p className="mt-4 max-w-prose text-muted">
            Handmade · Cotton, Oil Lamp &amp; Floating wicks
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 font-semibold text-bg shadow-sm transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Shop by Type */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-cream">
          Shop by Type
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group rounded-lg border border-gold/20 bg-surface p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg hover:shadow-black/30"
            >
              <div className="font-display text-xl text-cream transition group-hover:text-gold">
                {category.name}
              </div>
              {category.description && (
                <div className="mt-2 text-sm text-muted">
                  {category.description}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-cream">
            Featured
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Why our wicks */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-cream">
          Why our wicks
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { emoji: "🌿", text: "100% cotton" },
            { emoji: "🔥", text: "Long, steady burn" },
            { emoji: "🤲", text: "Handmade" },
          ].map((item) => (
            <div
              key={item.text}
              className="rounded-lg border border-gold/15 bg-surface p-8 text-center"
            >
              <div className="text-4xl">{item.emoji}</div>
              <div className="mt-3 text-cream">{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact band */}
      <section className="bg-gradient-to-b from-surface to-[#3a1d0c]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-cream">
            Have a question or bulk order?
          </h2>
          <p className="mt-3 max-w-prose text-muted">
            Reach out and we&apos;ll help you pick the right wicks for your lamps.
          </p>
          <div className="mt-8 flex justify-center">
            <ContactButtons />
          </div>
        </div>
      </section>
    </main>
  );
}
