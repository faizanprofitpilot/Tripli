import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  FREE_TRIP_GENERATIONS,
  PRO_PLAN_PRICE_USD,
  PRO_PLAN_LABEL,
} from "@/lib/billing-constants";

export { FREE_TRIP_GENERATIONS, PRO_PLAN_PRICE_USD, PRO_PLAN_LABEL };

/** Subscription statuses that unlock Pro features. */
const PRO_STATUSES = new Set(["active", "trialing"]);

export function isProStatus(status: string | null | undefined): boolean {
  return !!status && PRO_STATUSES.has(status);
}

export async function userHasProAccess(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  return isProStatus(data?.status ?? null);
}

export async function getLifetimeTripsGenerated(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from("profiles")
    .select("lifetime_trips_generated")
    .eq("id", userId)
    .maybeSingle();
  return data?.lifetime_trips_generated ?? 0;
}

export type TripGenerationGateResult =
  | { ok: true }
  | { ok: false; message: string; requiresSubscription: true };

/**
 * Enforce: first generation free, then Pro required.
 * Call before expensive AI work.
 */
export async function assertCanGenerateTrip(userId: string): Promise<TripGenerationGateResult> {
  const supabase = await createServerSupabaseClient();
  const pro = await userHasProAccess(supabase, userId);
  if (pro) return { ok: true };

  const generated = await getLifetimeTripsGenerated(supabase, userId);
  if (generated >= FREE_TRIP_GENERATIONS) {
    return {
      ok: false,
      requiresSubscription: true,
      message:
        "You’ve already used your free trip. Upgrade to Tripli Pro ($19/mo) for unlimited trip generations.",
    };
  }
  return { ok: true };
}

export type BillingState = {
  lifetimeTripsGenerated: number;
  hasPro: boolean;
  subscription: {
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    stripe_customer_id: string | null;
  } | null;
};

export async function getBillingStateForUser(userId: string): Promise<BillingState> {
  const supabase = await createServerSupabaseClient();
  const [gen, subRow] = await Promise.all([
    getLifetimeTripsGenerated(supabase, userId),
    supabase
      .from("user_subscriptions")
      .select("status, current_period_end, cancel_at_period_end, stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const sub = subRow.data;
  const hasPro = isProStatus(sub?.status ?? null);

  return {
    lifetimeTripsGenerated: gen,
    hasPro,
    subscription: sub
      ? {
          status: sub.status,
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end,
          stripe_customer_id: sub.stripe_customer_id,
        }
      : null,
  };
}
