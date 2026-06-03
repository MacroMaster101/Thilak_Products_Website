import Link from "next/link";
import { storeConfig } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/category/cotton-wick", label: "Cotton" },
  { href: "/category/oil-lamp-wick", label: "Oil Lamp" },
  { href: "/category/floating-wick", label: "Floating" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="block h-4 w-4 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 35%, #fff3c4 0%, #f3d9a6 25%, #c9821f 60%, #8a4a0c 100%)",
              boxShadow:
                "0 0 6px 1px rgba(201,130,31,0.9), 0 0 14px 4px rgba(201,130,31,0.45)",
            }}
          />
          <span className="font-display text-2xl font-semibold tracking-wide text-cream transition-colors group-hover:text-gold">
            {storeConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href={buildWhatsAppLink(storeConfig.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-bg transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
