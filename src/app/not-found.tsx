import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-5xl font-semibold text-cream">
        Page not found
      </h1>
      <p className="mt-4 text-muted">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 font-semibold text-bg shadow-sm transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
      >
        Back home
      </Link>
    </main>
  );
}
