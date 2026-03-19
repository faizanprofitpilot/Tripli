import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout Session for Tripli Pro (subscription).
 * Requires authenticated user. Uses service role to upsert stripe_customer_id.
 */
export async function POST() {
  const priceId = process.env.STRIPE_PRICE_ID_PRO?.trim();
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Checkout isn’t configured: set STRIPE_PRICE_ID_PRO in production (your Stripe Price ID, e.g. price_xxx).",
        code: "MISSING_STRIPE_PRICE_ID",
      },
      { status: 503 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "Checkout needs SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL on the server (used once to store your Stripe customer id).",
        code: "MISSING_SUPABASE_SERVICE_ROLE",
      },
      { status: 503 }
    );
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json(
      {
        error: "Could not connect to Supabase with the service role key. Check env vars in your host dashboard.",
        code: "ADMIN_CLIENT_FAILED",
      },
      { status: 503 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();

    const { data: existing } = await admin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      const { error: upsertErr } = await admin.from("user_subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          status: "none",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (upsertErr) {
        console.error("[checkout] upsert customer", upsertErr);
        return NextResponse.json({ error: "Could not save billing customer." }, { status: 500 });
      }
    }

    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/dashboard/billing?checkout=success`,
      cancel_url: `${base}/pricing?checkout=canceled`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: { enabled: false },
    });

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL returned." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
