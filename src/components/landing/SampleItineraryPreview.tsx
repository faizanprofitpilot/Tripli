import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { HERO_DESTINATION_CARDS } from "@/data/hero-destinations";

const SAMPLES = HERO_DESTINATION_CARDS.slice(0, 3);

export function SampleItineraryPreview() {
  return (
    <section id="sample" className="px-4 py-20 sm:px-6 lg:px-8 bg-slate-50/80">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center sm:text-4xl">
          Pick a place — we&apos;ll fill in the rest
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto text-lg">
          Tap a trip to open the planner with that destination ready.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <Link key={s.destination} href={s.href} className="group block">
              <Card className="h-full overflow-hidden rounded-[var(--radius-card-lg)] border border-slate-200 bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-smooth">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-3 text-white font-semibold text-lg drop-shadow">
                    {s.destination}
                  </span>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-slate-500">{s.days} days</p>
                      <p className="text-sm text-slate-600 mt-2">{s.tagline}</p>
                    </div>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
