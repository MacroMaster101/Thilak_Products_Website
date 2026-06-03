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
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="h-72 overflow-hidden rounded-lg bg-surface-2">
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {product.images.slice(1).map((src, i) => (
                <div
                  key={i}
                  className="h-16 w-16 overflow-hidden rounded-md bg-surface-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${product.name} ${i + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-display text-4xl font-semibold text-cream">
            {product.name}
          </h1>
          <div className="mt-2 text-lg text-gold">{displayPrice(product)}</div>
          <p className="mt-6 whitespace-pre-line text-muted">
            {product.description}
          </p>

          {product.variants.length > 0 && (
            <div className="mt-8">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Sizes
              </div>
              <ul className="mt-3 divide-y divide-gold/15 border-y border-gold/15">
                {product.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-cream">{variant.label}</span>
                    <span className="text-gold">{formatRs(variant.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <ContactButtons productName={product.name} />
          </div>

          <div className="mt-6">
            <Link
              href={`/contact?product=${encodeURIComponent(product.name)}`}
              className="text-sm text-muted underline underline-offset-4 transition hover:text-cream"
            >
              Ask about this product
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
