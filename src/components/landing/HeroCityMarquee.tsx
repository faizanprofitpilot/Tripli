import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { HERO_DESTINATION_CARDS } from "@/data/hero-destinations";

function CityCard({ s }: { s: (typeof HERO_DESTINATION_CARDS)[number] }) {
  return (
    <Link href={s.href} className="group block w-[260px] shrink-0 sm:w-[280px]">
      <Card className="h-full gap-0 overflow-hidden rounded-[var(--radius-card-lg)] border border-slate-200 bg-white p-0 py-0 shadow-card transition-smooth hover:shadow-card-hover hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] min-h-[176px] overflow-hidden rounded-t-[var(--radius-card-lg)] bg-slate-200">
          {/* Native img: Next/Image was flaky for off-screen marquee slides + some Unsplash IDs */}
          <img
            src={s.image}
            alt={s.alt}
            width={800}
            height={600}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-90" />
          <span className="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
            {s.destination}
          </span>
        </div>
        <CardContent className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">{s.days} days</p>
              <p className="mt-1.5 text-sm leading-snug text-slate-600">{s.tagline}</p>
            </div>
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function HeroCityMarquee() {
  const loop = [...HERO_DESTINATION_CARDS, ...HERO_DESTINATION_CARDS];

  return (
    <div className="w-full">
      <p className="mb-6 px-4 text-center text-sm text-slate-600 sm:text-base">
        Tap a trip to open the planner with that destination ready.
      </p>
      <div
        className="hero-marquee-clip relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        aria-label="Suggested destinations"
      >
        <div className="hero-city-marquee-track flex w-max gap-4 pr-4 sm:gap-5 sm:pr-5">
          {loop.map((s, i) => (
            <CityCard key={`${s.destination}-${i}`} s={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
