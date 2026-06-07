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
    <main className="bg-bg">
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-surface-2 py-16 sm:py-24 border-b border-gold/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-7 text-left">
              <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                Premium Handmade Wicks
              </span>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl">
                Carry Your Light with Pure Cotton Wicks
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Crafted by hand for an organic, clean, and steady burn. Perfect for daily prayers, festive celebrations, and creating serene atmospheres.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105"
                >
                  Browse Products
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-8 py-3.5 font-semibold text-cream transition-all duration-300 hover:border-gold hover:bg-gold/5"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-gold/10 bg-surface p-2 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero_diya_warm.png"
                  alt="Burning traditional brass lamp with pure cotton wicks"
                  className="h-80 w-full rounded-xl object-cover shadow-inner sm:h-96 md:h-80 lg:h-96"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Type */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Categories
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
            Shop by Type
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-16 bg-gold/50" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((category) => {
            // Map category slug to static generated image
            let imgPath = "/images/cat_cotton_wick.png";
            if (category.slug === "oil-lamp-wick") {
              imgPath = "/images/cat_oil_wick.png";
            } else if (category.slug === "floating-wick") {
              imgPath = "/images/cat_floating_wick.png";
            }

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-xl border border-gold/15 bg-surface shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-lg"
              >
                <div className="h-64 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgPath}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3 className="font-display text-2xl font-semibold text-white group-hover:text-gold transition-colors duration-300">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-surface-2 border-y border-gold/10 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Our Favorites
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
                Featured Wicks
              </h2>
              <div className="mx-auto mt-2 h-0.5 w-16 bg-gold/50" />
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why our wicks */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Uncompromising Quality
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
            Why Our Wicks Stand Out
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-16 bg-gold/50" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              title: "100% Pure Organic Cotton",
              emoji: "🌿",
              description: "Sourced from high-grade natural cotton, offering an unadulterated burn completely free of toxic chemical binders or synthetic fibers.",
            },
            {
              title: "Long, Steady & Stable Burn",
              emoji: "🔥",
              description: "Designed with optimized fiber tension for perfect oil absorption capillary action, leading to flicker-free, slow, and smoke-free flames.",
            },
            {
              title: "Artisanal Handmade Quality",
              emoji: "🤲",
              description: "Every single wick is rolled and finished with meticulous care by local hands, carrying traditional blessings and precise quality control.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-gold/15 bg-white p-8 text-center transition-all duration-300 hover:border-gold/30 hover:shadow-md"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-between rounded-full bg-gold/5 text-3xl justify-center transition-all duration-300 group-hover:scale-110">
                <span className="mx-auto">{item.emoji}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-cream">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact band */}
      <section className="bg-gradient-to-b from-surface to-surface-2 border-t border-gold/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Get In Touch
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
            Have a Question or Bulk Order?
          </h2>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
            Reach out directly. We will help you select the exact wicks required for your specific lamps, festivals, or custom setups.
          </p>
          <div className="mt-8 flex justify-center">
            <ContactButtons />
          </div>
        </div>
      </section>
    </main>
  );
}
