# Tripli

**Your trip, already planned.** Tripli is an AI travel planner that generates a complete multi-day itinerary from your destination and preferences. Get a full trip with hotel, day-by-day activities, meals, cost estimate, and an interactive map—then swap hotels or activities or regenerate a day with one click.

## Stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui**
- **Supabase** (database + auth)
- **OpenAI** (itinerary generation)
- **Google Places API** (place search, details, photos)
- **Google Maps JavaScript API** (map and markers)

## Setup

1. **Clone and install**
   ```bash
   cd Tripli && npm install
   ```

2. **Environment variables**  
   Copy `.env.example` to `.env.local` and set real values (never commit `.env.local` or expose keys):
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for Stripe webhooks + checkout customer sync)
   - `OPENAI_API_KEY`
   - `GOOGLE_PLACES_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (one key for both is fine; restrict by referrer for client)
   - **Billing (optional for local dev):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`, `NEXT_PUBLIC_SITE_URL` — see [`docs/STRIPE.md`](docs/STRIPE.md)

3. **Supabase**  
   - Create a project and run migrations in order: `001_initial_schema.sql`, `002_auth_and_rls.sql`, then `003`–`005` as needed (`005_billing.sql` adds profiles, subscription mirror, and trip-generation counting for billing).
   - In Supabase Dashboard → Authentication → Providers, enable **Email** (and optionally **Confirm email** off for dev).

4. **Google Cloud**  
   Enable **Maps JavaScript API**, **Places API** (classic), and **Places API (New)**. Create an API key and restrict as needed (HTTP referrer for client). Place photos are proxied server-side so the key is never sent to the browser.

5. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` — Landing (public)
- `/pricing` — Plans & Stripe checkout (public; checkout requires login)
- `/login`, `/signup` — Auth (public)
- `/dashboard` — Your trips (requires login)
- `/dashboard/billing` — Plan status, fair-use copy, Stripe Customer Portal (requires login)
- `/planner` — Trip preferences form (requires login)
- `/plan`, `/plan/complete` — Wizard flow (complete requires login)
- `/trip/[id]` — Generated trip view (requires login, owner only)

## Billing

- **Free:** one lifetime AI trip generation per account (tracked in the database; deleting a trip does not reset this).
- **Tripli Pro:** $19/mo via Stripe Subscription — unlimited trip generations.
- Webhook endpoint: `POST /api/webhooks/stripe`. Full setup: [`docs/STRIPE.md`](docs/STRIPE.md).

## Deploy (Vercel)

Connect the repo, add the same env vars, and deploy. Ensure the Google API key allows your Vercel domain.
