import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PricingSection } from "@/components/landing/PricingSection";
import { getSessionUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Pricing — Tripli",
  description: "Tripli Pro — unlimited AI trip itineraries.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  const canceled = params.checkout === "canceled";

  return (
    <div className="min-h-screen flex flex-col page-bg">
      <Navbar />
      <main className="flex-1">
        {canceled && (
          <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            Checkout was canceled. No charge was made. You can subscribe anytime below.
          </div>
        )}
        <div className="mx-auto max-w-3xl px-4 pt-10 text-center sm:pt-14">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pricing
          </h1>
          <p className="mt-3 text-muted-foreground">
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Log in
            </Link>{" "}
            to subscribe, or{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              sign up
            </Link>{" "}
            for an account.
          </p>
        </div>
        <PricingSection showCheckout={!!user} className="pb-20" />
      </main>
    </div>
  );
}
