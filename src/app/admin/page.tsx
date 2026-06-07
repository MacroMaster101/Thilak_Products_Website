import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireUser();

  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-cream">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-gold px-5 py-2.5 font-semibold text-bg shadow-sm transition hover:brightness-110"
        >
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 rounded-lg border border-gold/15 bg-surface-2 p-8 text-center text-muted">
          No products yet. Create your first one.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-gold/15">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-surface text-cream">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 text-center font-medium">Featured</th>
                <th className="px-4 py-3 text-center font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gold/10 bg-surface-2 text-cream"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.category.name}</td>
                  <td className="px-4 py-3 text-muted">{displayPrice(p)}</td>
                  <td className="px-4 py-3 text-center">
                    {p.isFeatured ? (
                      <span className="text-gold">★</span>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.isActive ? (
                      <span className="text-gold">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-gold hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
