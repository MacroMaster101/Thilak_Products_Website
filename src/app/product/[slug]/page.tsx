import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { displayPrice, formatRs } from "@/lib/pricing";
import { ContactButtons } from "@/components/site/ContactButtons";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 bg-bg">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-gold/15 bg-white p-2 shadow-sm">
            <div className="h-96 overflow-hidden rounded-xl bg-surface-2 sm:h-[450px]">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-300 hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-between justify-center bg-surface-2 text-4xl">
                  🪔
                </div>
              )}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {product.images.slice(1).map((src, i) => (
                <div
                  key={i}
                  className="h-20 w-20 overflow-hidden rounded-xl border border-gold/10 bg-white p-1 shadow-sm transition-transform duration-300 hover:scale-105"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${product.name} ${i + 2}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Handcrafted Collection
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-3 font-display text-2xl font-semibold text-gold">
            {displayPrice(product)}
          </div>
          
          <div className="my-8 h-px bg-gold/15" />
          
          <p className="whitespace-pre-line text-base leading-relaxed text-muted">
            {product.description}
          </p>

          {product.variants.length > 0 && (
            <div className="mt-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Available Variations & Sizes
              </span>
              <ul className="mt-3 divide-y divide-gold/10 border-y border-gold/10 bg-white/50 px-4 rounded-xl border">
                {product.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between py-3.5 text-sm"
                  >
                    <span className="font-medium text-cream">{variant.label}</span>
                    <span className="font-semibold text-gold">{formatRs(variant.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <ContactButtons productName={product.name} />
          </div>

          <div className="mt-6 border-t border-gold/5 pt-6">
            <Link
              href={`/contact?product=${encodeURIComponent(product.name)}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-gold"
            >
              <span>✉</span>
              <span className="underline underline-offset-4">Ask a question or request custom bulk orders</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
