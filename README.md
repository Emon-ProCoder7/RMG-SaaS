# RMG Suite

Inventory & operations platform for ready-made garments (RMG) businesses.
Built with **Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase**.

This is the first module (**Inventory**) of the planned RMG SaaS — designed to grow
into invoicing, supply chain, client management, profit reporting, forecasting and a
Zakat calculator.

## Features (current)

- **Dashboard** — total items, total units, inventory value, low-stock alerts, recent movements.
- **Inventory** — searchable item table, add/edit items, per-item stock value, low-stock badges.
- **Stock movements** — record stock-in / stock-out / adjustments; quantity updates automatically (DB trigger).
- **Categories** — group items, see item counts.
- **Auth** — Supabase email/password login, route protection (via `proxy.ts`).

## Preview mode

Until you add real Supabase credentials, the app runs in **preview mode**: it shows
sample data and disables auth, so you can browse the whole UI immediately. A banner
indicates preview mode.

## Go live (connect your own Supabase)

1. Create a project at [supabase.com](https://supabase.com) (**your own** account).
2. In the Supabase **SQL Editor**, run `supabase/migrations/0001_inventory.sql`
   (and optionally `supabase/seed.sql` for sample data).
3. Copy `.env.local.example` to `.env.local` and fill in your values from
   **Supabase → Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Restart `npm run dev`. The app is now live against your database.

## Deploy to Vercel

- Import this repo in Vercel. It deploys as-is in **preview mode** (no env vars needed).
- To go live, add the three env vars above in **Vercel → Project → Settings →
  Environment Variables**, then redeploy.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```
