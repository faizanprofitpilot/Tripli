# Stripe billing setup (Tripli)

## 1. Stripe Dashboard

1. Create a **Product** (e.g. “Tripli Pro”) with a **recurring monthly** price of **$19 USD**.
2. Copy the **Price ID** (`price_...`) → `STRIPE_PRICE_ID_PRO`.
3. Under **Developers → API keys**, copy the **Secret key** → `STRIPE_SECRET_KEY`.

## 2. Customer portal (best practice)

1. **Settings → Billing → Customer portal**
2. Enable the portal and allow customers to **cancel subscriptions**, **update payment methods**, and **view invoices**.
3. Set the **business information** and **terms / privacy** links Stripe asks for.

Checkout and the portal use your app URLs; no need to set Stripe “default return URL” beyond what the API sends.

## 3. Webhooks

**Production**

1. **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
3. Events to send (minimum):
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`.

**Local development**

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the webhook signing secret the CLI prints as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## 4. Supabase

1. Run migration `005_billing.sql` (SQL editor or `supabase db push`).
2. Set **`SUPABASE_SERVICE_ROLE_KEY`** in the app environment (server-only). Never expose it to the client.

## 5. App environment

See `.env.example`. Required for billing:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (production URL, no trailing slash)

## 6. Behavior summary

- **First trip** per account is free (tracked in `profiles.lifetime_trips_generated`, incremented on each successful trip insert).
- **Further trips** require an **active** or **trialing** Stripe subscription (`user_subscriptions.status`).
- **Past due** after a failed payment does **not** count as Pro until payment succeeds again (`subscription.updated` will refresh status).

## 7. Compliance notes (high level)

- Receipts and tax: Stripe sends receipts; configure tax in Stripe if you charge VAT/GST.
- **EU/UK**: respect consumer withdrawal rules where applicable; your billing page links users to manage/cancel via the portal.
- Keep product copy and pricing aligned with Stripe product description and your Terms.
