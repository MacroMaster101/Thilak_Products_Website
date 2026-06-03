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
      className="group block overflow-hidden rounded-lg border border-transparent bg-surface shadow-sm transition duration-200 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-black/30"
    >
      <div className="h-40 overflow-hidden bg-surface-2">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"
          />
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-cream">{product.name}</div>
        <div className="mt-1 text-sm text-gold">{displayPrice(product)}</div>
      </div>
    </Link>
  );
}
