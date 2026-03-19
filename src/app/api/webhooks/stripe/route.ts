import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function upsertSubscriptionFromStripe(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  userId: string,
  customerId: string,
  sub: Stripe.Subscription
) {
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const status = sub.status;
  // Stripe SDK types omit some fields on Subscription in strict mode
  const periodEndUnix = (sub as unknown as { current_period_end?: number }).current_period_end;
  const periodEnd =
    typeof periodEndUnix === "number" ? new Date(periodEndUnix * 1000).toISOString() : null;

  const { error } = await admin.from("user_subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status,
      price_id: priceId,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[stripe webhook] upsert subscription", error);
    throw error;
  }
}

export async function POST(req: Request) {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET missing");
    return new NextResponse("Webhook not configured", { status: 500 });
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch (e) {
    console.error("[stripe webhook] admin client", e);
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error("[stripe webhook] signature", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId =
          session.client_reference_id ||
          session.metadata?.supabase_user_id ||
          null;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!userId || !customerId || !subId) {
          console.warn("[stripe webhook] checkout.session.completed missing ids", {
            userId: !!userId,
            customerId: !!customerId,
            subId: !!subId,
          });
          break;
        }

        const sub = await getStripe().subscriptions.retrieve(subId);
        await upsertSubscriptionFromStripe(admin, userId, customerId, sub);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!userId || !customerId) {
          console.warn("[stripe webhook] subscription event missing metadata", event.type);
          break;
        }
        await upsertSubscriptionFromStripe(admin, userId, customerId, sub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const { data: row } = await admin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (row?.user_id) {
          await admin
            .from("user_subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", row.user_id as string);
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook] handler", e);
    return new NextResponse("Webhook handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
