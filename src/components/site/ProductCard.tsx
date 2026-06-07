import Link from "next/link";
import { displayPrice } from "@/lib/pricing";

type CardProduct = {
  slug: string;
  name: string;
  images: string[];
  basePrice: number | null;
  variants: { price: number }[];
};

export function ProductCard({ product }: { product: CardProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-gold/10 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-md"
    >
      <div className="h-44 overflow-hidden bg-surface-2 sm:h-48">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-between justify-center bg-surface-2 text-2xl">
            🪔
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gold/5">
        <h3 className="font-sans text-sm font-medium text-cream line-clamp-1 group-hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-1.5 font-display text-base font-semibold text-gold">
          {displayPrice(product)}
        </p>
      </div>
    </Link>
  );
}
