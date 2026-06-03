# Thilak Products — Wick Store Design

**Date:** 2026-06-03
**Status:** Approved (pending spec review)

## Overview

A catalog + inquiry website for **Thilak Products**, selling cotton wicks, oil lamp
wicks, and floating wicks. Customers browse products and contact the store to order —
there is **no online cart or payment** in v1. A login-protected admin panel lets staff
manage products.

- **Currency:** Sri Lankan Rupee (Rs)
- **Visual style:** Warm & traditional — deep browns, gold, glowing flame, serif headings
- **Inquiry channels:** WhatsApp (primary), phone call, contact form, email

## Scope

**In scope (v1):**
- Public catalog: homepage, category pages, product detail pages, contact, about
- Product detail with optional size/variant list and per-variant pricing
- Inquiry via WhatsApp (pre-filled), call, contact form (emailed + logged), email link
- Admin: login, product CRUD, variant management, image upload, featured/active toggles

**Out of scope (future):**
- Shopping cart, online checkout, payment gateway
- Customer accounts / order history
- Inventory tracking

The architecture (DB-backed, admin-managed) is chosen so cart/checkout can be added
later without a rewrite.

## Tech Stack

- **Framework:** Next.js 15 (App Router, React, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui, warm/traditional theme
- **Backend platform:** Supabase
  - **Database:** Supabase Postgres
  - **Auth:** Supabase Auth (admin login, protects `/admin`)
  - **Image storage:** Supabase Storage bucket for product photos
- **ORM / migrations:** Prisma owns the schema and migrations, pointed at the Supabase
  Postgres connection string. The Supabase client is used only for auth and file
  uploads — Prisma and Supabase do not both manage migrations.
- **Contact email:** Resend (free tier)
- **Hosting:** Vercel (free) + Supabase (free tier)

### Three surfaces, one app
1. **Public site** — server-rendered, reads from Supabase Postgres via Prisma.
2. **Admin** (`/admin`, Supabase-Auth-protected) — product/variant CRUD, image upload,
   featured/active toggles.
3. **Contact API** — route handler that validates input, emails the store via Resend,
   and logs the inquiry to the database.

## Data Model

```
Category
  id, slug, name, description, displayOrder
  Seed: "Cotton Wick" | "Oil Lamp Wick" | "Floating Wick"

Product
  id, slug, name, description, categoryId -> Category
  basePrice (nullable — used when product has no variants)
  images: string[]   (Supabase Storage URLs; first = primary)
  isFeatured (bool)  — appears in homepage "Featured"
  isActive (bool)    — hide without deleting
  createdAt, updatedAt

ProductVariant   (optional — supports "mix of both" products)
  id, productId -> Product
  label   ("Small" / "Medium" / "10 inch" / "Pack of 50")
  price
  displayOrder

ContactInquiry
  id, name, email, phone, productName, message, createdAt

Admin users — managed by Supabase Auth (not a Prisma table)
```

**Pricing rule:**
- Product **with** variants → card shows `from Rs X` (lowest variant price); detail page
  lists each variant with its price.
- Product **without** variants → shows `basePrice`.

**Contact inquiries** are emailed via Resend *and* saved to `ContactInquiry`, so a record
exists even if email delivery fails.

## Pages & Routes

**Public:**
- `/` — homepage: hero → shop by type → featured products → why our wicks → contact band → footer
- `/products` — all products, filterable by category
- `/category/[slug]` — per-category listing (Cotton / Oil Lamp / Floating)
- `/product/[slug]` — detail: image gallery, description, variant list + prices,
  **Order on WhatsApp** (pre-filled with product name), Call, "Ask about this product" form link
- `/contact` — form + WhatsApp + phone + email + address
- `/about` — short brand/story page

**Admin (login required):**
- `/admin/login` — Supabase Auth sign-in
- `/admin` — product list (search, featured/active toggles)
- `/admin/products/new`, `/admin/products/[id]` — create/edit: name, category,
  description, image upload, variant rows (add/remove), base price, featured/active
- Delete with confirmation

**Config (environment-driven, easy to change):** store WhatsApp number, phone, email,
and address.

## Error Handling

- Invalid product/category slug → themed 404
- Admin routes → redirect to `/admin/login` when unauthenticated; **server-side auth
  check on every admin action** (never trust the client)
- Contact form → Zod validation; on email failure, still persist the inquiry and confirm
  success to the user; inline field-level errors
- Image upload → enforce size/type limits; graceful failure message
- Missing env vars (DB URL, Supabase keys, Resend key, WhatsApp number) → fail fast at
  startup with a clear message

## Testing (TDD — tests precede implementation)

- **Unit (Vitest):** pricing logic (`from Rs X` vs base price), WhatsApp link builder,
  Zod contact schema
- **Integration:** product/category queries against a test DB; contact API route
- **E2E (Playwright):**
  - browse → product page → WhatsApp link is correctly pre-filled
  - admin login → create product → it appears on the public site
  - contact form submits and shows confirmation
