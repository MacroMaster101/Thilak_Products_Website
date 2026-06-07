import Image from "next/image";
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
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt={`${storeConfig.name} logo`}
            width={48}
            height={48}
            priority
            className="h-11 w-11 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-2xl font-semibold tracking-wide text-cream transition-colors duration-300 group-hover:text-gold">
            {storeConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors duration-300 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href={buildWhatsAppLink(storeConfig.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-whatsapp px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
