import Link from "next/link";

interface FinalCtaSectionProps {
  isLoggedIn?: boolean;
}

export function FinalCtaSection(_props: FinalCtaSectionProps) {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Where are you going next?
        </h2>
        <p className="mt-4 text-slate-600 text-lg">
          Type a city and see a full draft trip in about ten seconds.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/plan"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground shadow-primary btn-primary-premium active:scale-[0.98]"
          >
            Plan my trip
          </Link>
          <Link
            href="#preview"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white px-8 text-base font-semibold text-slate-800 hover:bg-slate-50 transition-smooth"
          >
            See a real itinerary
          </Link>
        </div>
      </div>
    </section>
  );
}
