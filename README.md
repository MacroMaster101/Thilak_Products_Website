# Thilak Products

Catalog and inquiry website for **Thilak Products**, a Sri Lankan maker of cotton wicks, oil lamp wicks, and floating wicks. The public site lets customers browse products by type, view product details with prices in Rs, and inquire via WhatsApp, phone, email, or a contact form (no online checkout). A Supabase-authenticated admin area lets the store owner create, edit, and manage products and their images.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — warm/traditional theme with Cormorant Garamond + Mulish fonts
- **Supabase** — Postgres database, Auth (admin login), and Storage (the `product-images` bucket)
- **Prisma 7** with the `@prisma/adapter-pg` driver adapter (connection configured in `prisma.config.ts`)
- **Resend** — transactional email for contact-form inquiries
- **Vitest** (unit + integration) and **Playwright** (E2E)

## Prerequisites

- **Node.js 18+** (this project is developed on Node 24)
- A **Supabase** project (free tier hosts the Postgres DB, Auth, and Storage)
- Optionally, a **Resend** account if you want contact-form inquiries emailed to you

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` (or `.env.local`) and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | Supabase Postgres connection string. Use the connection URI from your Supabase project settings. Prisma 7 reads this via `prisma.config.ts`, which loads `.env.local` first, then falls back to `.env`. |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key. |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only; used for image uploads). |
   | `RESEND_API_KEY` | Resend API key for sending inquiry emails. With a placeholder key the inquiry is still saved to the database — only the email send is skipped. |
   | `CONTACT_EMAIL_TO` | Address that contact-form inquiries are emailed to. |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for the "Order on WhatsApp" links (digits only, e.g. `94770000000`). |
   | `NEXT_PUBLIC_STORE_PHONE` | Displayed store phone number. |
   | `NEXT_PUBLIC_STORE_EMAIL` | Displayed store email. |
   | `NEXT_PUBLIC_STORE_ADDRESS` | Displayed store address. |

3. **Configure Supabase**

   - Under **Storage**, create a **public** bucket named `product-images`.
   - Under **Authentication**, create an admin user (email + password) and **disable public sign-ups** so only you can log into the admin area.

4. **Create and seed the database**

   ```bash
   npx prisma migrate dev   # or: npm run db:migrate — creates the tables
   npm run db:seed          # seeds the 3 product categories
   ```

5. **Run the app**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>. The admin area lives at `/admin` — log in with the Supabase user you created above.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run unit + integration tests once (Vitest). |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run the Playwright E2E suite. |
| `npm run db:migrate` | `prisma migrate dev` — apply migrations in development. |
| `npm run db:seed` | Seed the category data. |
| `npm run db:generate` | Generate the Prisma client. |

## Testing

- **Unit + integration:** `npm test`. The integration tests run against the configured `DATABASE_URL`, so a reachable database is required.
- **E2E:** `npm run test:e2e`. Playwright starts the dev server automatically. The admin spec only runs when `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` are set in the environment; otherwise those tests are skipped.

## Deployment

Deploy on **Vercel**:

- Set every environment variable from the table above in the Vercel project settings.
- Supabase (free tier) hosts the database, Auth, and Storage.
- Run production migrations with `npx prisma migrate deploy`.

## Project structure

```
src/app/             App Router routes — public pages (/, /products, /category/[slug],
                     /product/[slug], /contact, /about), the /api/contact route, and the
                     Supabase-auth-protected /admin area
src/components/site/  Shared UI: Header, Footer, ProductCard, ContactForm, ProductForm,
                     ContactButtons
src/lib/             Helpers: prisma client, Supabase clients, auth (requireUser), queries,
                     storage upload, pricing, whatsapp link builder, validation, env/config
prisma/              Prisma schema, migrations, and the category seed script
```

## Prisma 7 notes

- The database connection is configured in `prisma.config.ts`, which manually loads `.env.local` (preferred) or `.env` so the Prisma CLI uses the same `DATABASE_URL` as the app.
- The Prisma client uses the `@prisma/adapter-pg` driver adapter over the `pg` Postgres driver.
