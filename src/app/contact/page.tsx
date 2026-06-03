import { storeConfig } from "@/lib/config";
import { ContactButtons } from "@/components/site/ContactButtons";
import { ContactForm } from "@/components/site/ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-cream">
        Contact Us
      </h1>

      {storeConfig.address && (
        <p className="mt-3 text-muted">{storeConfig.address}</p>
      )}

      <div className="mt-8">
        <ContactButtons productName={product} />
      </div>

      <ContactForm defaultProduct={product} />
    </main>
  );
}
