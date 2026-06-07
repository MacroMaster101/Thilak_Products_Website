import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-gold/15 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/admin"
            className="font-display text-lg font-semibold text-cream hover:text-gold"
          >
            Admin · Products
          </Link>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-gold/30 px-4 py-1.5 text-sm text-cream transition hover:border-gold hover:text-gold"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
