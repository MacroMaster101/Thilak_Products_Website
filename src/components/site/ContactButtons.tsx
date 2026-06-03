import { storeConfig } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type ContactButtonsProps = {
  productName?: string;
};

export function ContactButtons({ productName }: ContactButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={buildWhatsAppLink(storeConfig.whatsappNumber, productName)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 font-semibold text-bg shadow-sm transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
      >
        Order on WhatsApp
      </a>
      <a
        href={`tel:${storeConfig.phone}`}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-bg shadow-sm transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
      >
        Call
      </a>
      <a
        href={`mailto:${storeConfig.email}`}
        className="inline-flex items-center gap-2 rounded-full border border-gold px-6 py-3 font-semibold text-gold transition duration-200 hover:-translate-y-0.5 hover:bg-gold hover:text-bg"
      >
        Email
      </a>
    </div>
  );
}
