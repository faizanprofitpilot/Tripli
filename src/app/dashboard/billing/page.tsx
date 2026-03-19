import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { getSessionUser } from "@/lib/supabase/auth";
import { getBillingStateForUser, FAIR_USE_DISCLAIMER, PRO_PLAN_LABEL } from "@/lib/billing";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PortalButton } from "@/components/billing/PortalButton";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Billing — Tripli",
};

function formatRenewal(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/dashboard/billing");

  const state = await getBillingStateForUser(user.id);
  const params = await searchParams;
  const checkoutOk = params.checkout === "success";

  return (
    <div className="min-h-screen flex flex-col page-bg">
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to trips
          </Link>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Billing & plan</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your subscription, payment method, and invoices (via Stripe).
          </p>

          {checkoutOk && (
            <div
              className="mt-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
              role="status"
            >
              Thanks! If your subscription is active, you can generate unlimited trips (fair use
              applies). It may take a few seconds for status to update.
            </div>
          )}

          <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Current plan</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium text-foreground text-right">
                  {state.hasPro ? "Tripli Pro" : "Free"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trips generated (lifetime)</dt>
                <dd className="font-medium text-foreground text-right tabular-nums">
                  {state.lifetimeTripsGenerated}
                </dd>
              </div>
              {state.hasPro && state.subscription?.current_period_end && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Current period ends</dt>
                  <dd className="font-medium text-foreground text-right">
                    {formatRenewal(state.subscription.current_period_end)}
                  </dd>
                </div>
              )}
              {state.hasPro && state.subscription?.cancel_at_period_end && (
                <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  Your subscription is set to cancel at the end of this billing period. You&apos;ll
                  keep Pro access until then.
                </p>
              )}
              {state.subscription && !state.hasPro && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Subscription status</dt>
                  <dd className="font-medium text-foreground text-right capitalize">
                    {state.subscription.status.replace(/_/g, " ")}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {!state.hasPro && (
                <CheckoutButton className="rounded-full px-6 font-semibold shadow-primary" size="lg">
                  Upgrade to Pro — {PRO_PLAN_LABEL}
                </CheckoutButton>
              )}
              {state.subscription?.stripe_customer_id && (
                <PortalButton className="rounded-full px-6" size="lg">
                  {state.hasPro ? "Manage billing & invoices" : "Payment method & invoices"}
                </PortalButton>
              )}
              <Link
                href="/pricing"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm font-medium hover:bg-muted sm:h-11 sm:px-6"
              >
                View pricing
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-muted/20 p-6">
            <h2 className="text-base font-semibold text-foreground">Fair use & receipts</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{FAIR_USE_DISCLAIMER}</p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>We email receipts through Stripe when your card is charged.</li>
              <li>
                EU/UK consumers: you have statutory withdrawal rights where applicable; see Stripe
                receipt and your local rules.
              </li>
              <li>Questions? Contact support from the email on your account.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
