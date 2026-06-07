export function formatRs(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

type PriceInput = {
  basePrice: number | null;
  variants: { price: number }[];
};

export function displayPrice({ basePrice, variants }: PriceInput): string {
  if (variants.length > 0) {
    const lowest = Math.min(...variants.map((v) => v.price));
    return `from ${formatRs(lowest)}`;
  }
  if (basePrice != null) return formatRs(basePrice);
  return "Price on request";
}
