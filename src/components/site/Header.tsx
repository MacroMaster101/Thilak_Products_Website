"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { storeConfig } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/category/cotton-wick", label: "Cotton" },
  { href: "/category/oil-lamp-wick", label: "Oil Lamp" },
  { href: "/category/floating-wick", label: "Floating" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
              className="nav-link-premium text-sm font-medium text-muted transition-colors duration-300 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden md:inline-flex" />

          <a
            href={buildWhatsAppLink(storeConfig.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center rounded-full bg-whatsapp px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 md:inline-flex"
          >
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 text-gold transition-colors hover:bg-gold/10 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          className="border-t border-gold/10 bg-surface px-4 py-4 sm:px-6 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center justify-between pt-2">
              <a
                href={buildWhatsAppLink(storeConfig.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center rounded-full bg-whatsapp px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:brightness-105"
              >
                WhatsApp
              </a>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
