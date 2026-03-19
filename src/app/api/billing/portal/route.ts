import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Stripe Customer Portal — update payment method, cancel, view invoices. */
export async function POST() {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: row } = await admin
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = row?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file. Subscribe from the pricing page first." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/dashboard/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("[portal]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Portal session failed" },
      { status: 500 }
    );
  }
}
