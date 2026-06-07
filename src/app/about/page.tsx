import { storeConfig } from "@/lib/config";

export const metadata = {
  title: `About ${storeConfig.name}`,
  description: `${storeConfig.name} makes pure cotton wicks for oil lamps, diyas, and floating bowls — handmade for a long, steady, clean burn.`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-cream">
        About {storeConfig.name}
      </h1>

      <div className="mt-6 space-y-4 text-muted">
        <p>
          {storeConfig.name} makes pure cotton wicks for oil lamps, diyas, and
          floating bowls. Each wick is handmade for a long, steady, clean burn —
          crafted for daily prayer and festival lighting.
        </p>
        <p>
          We keep our craft simple and honest: quality cotton, careful hands,
          and a wick that lights easily and burns true. Whether for a single
          evening lamp or a home full of diyas at festival time, our wicks are
          made to carry your light.
        </p>
      </div>

      {storeConfig.address && (
        <p className="mt-8 text-sm text-muted">{storeConfig.address}</p>
      )}
    </main>
  );
}
