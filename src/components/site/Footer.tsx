import Image from "next/image";
import Link from "next/link";
import { storeConfig } from "@/lib/config";

const footerLinks = [
  { href: "/products", label: "Shop" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/10 bg-surface-2">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt={`${storeConfig.name} logo`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <span className="font-display text-lg font-semibold text-cream">
              {storeConfig.name}
            </span>
            <span className="text-xs text-muted/80">
              © {year} {storeConfig.name}. All rights reserved.
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {storeConfig.address ? (
          <span className="text-xs text-muted/80 md:max-w-xs md:text-right">
            {storeConfig.address}
          </span>
        ) : null}
      </div>
    </footer>
  );
}
