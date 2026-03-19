import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PRO_PLAN_LABEL } from "@/lib/billing-constants";

const proFeatures = [
  "Unlimited trip generations",
  "Full itinerary with hotel, activities & map",
  "Dashboard to view saved trips",
  "Priority-friendly usage for active travelers",
  "Cancel anytime in the billing portal",
];

type PricingSectionProps = {
  id?: string;
  className?: string;
  /** When true, show checkout on Pro card (user must be logged in). */
  showCheckout?: boolean;
};

export function PricingSection({ id = "pricing", className, showCheckout }: PricingSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24", className)}>
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            One plan with everything you need to plan your trips.
          </p>
        </div>

        <div className="mt-12">
          <div className="relative flex flex-col rounded-2xl border-2 border-primary/35 bg-gradient-to-b from-primary/[0.06] to-card p-6 shadow-[0_8px_40px_-12px_var(--primary)/0.25] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Tripli Pro</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{PRO_PLAN_LABEL}</p>
            <p className="mt-1 text-sm text-muted-foreground">Unlimited trips · billed monthly</p>
            <ul className="mt-8 space-y-3 text-sm text-foreground/90">
              {proFeatures.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {showCheckout ? (
              <CheckoutButton className="mt-8 h-11 w-full rounded-full font-semibold shadow-primary">
                Subscribe with Stripe
              </CheckoutButton>
            ) : (
              <Link
                href="/signup?redirect=%2Fpricing"
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-primary transition-opacity hover:opacity-95"
              >
                Create account & subscribe
              </Link>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure checkout by Stripe · Taxes where applicable
            </p>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground leading-relaxed">
          Prices in USD. Subscriptions renew until canceled. You can update payment methods, download
          invoices, and cancel anytime from the{" "}
          <span className="font-medium text-foreground/80">billing portal</span> after checkout.
        </p>
      </div>
    </section>
  );
}
