"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How long does it take to get a full trip plan?",
    a: "Usually well under a minute. You enter your destination, dates, budget, and preferences — Tripli builds a day-by-day plan with places to stay, eat, and visit in one go.",
  },
  {
    q: "Do I need an account to try Tripli?",
    a: "You can explore the site and see how planning works. To generate and save real itineraries, you’ll create a free account so your trips stay in one place.",
  },
  {
    q: "Can I change hotels, restaurants, or activities after?",
    a: "Yes. Swap a hotel, replace an activity, or regenerate a single day without starting from scratch. The rest of your trip stays intact.",
  },
  {
    q: "What destinations can I plan?",
    a: "Any city or region you can name. Tripli uses real places with addresses and map-friendly data so your plan is usable on the ground.",
  },
  {
    q: "How do cost estimates work?",
    a: "You get rough ranges for hotels and activities to match your budget tier. They’re guides for planning — final prices depend on when and where you book.",
  },
  {
    q: "Is there a map of my trip?",
    a: "Yes. You can see your hotel and stops on a map, organized by day, so the route between places makes sense.",
  },
  {
    q: "Who is Tripli for?",
    a: "Anyone who wants a real itinerary fast — couples, friends, families, or solo travelers — without spending hours in tabs and spreadsheets.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/[0.03] to-background"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Questions, answered
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground text-lg">
          Everything you need to know before your next trip.
        </p>
        <ul className="mt-12 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border border-border/80 bg-card px-4 py-4 text-left shadow-sm transition-all",
                    "hover:border-primary/25 hover:shadow-md",
                    isOpen && "border-primary/30 shadow-md ring-1 ring-primary/10"
                  )}
                  aria-expanded={isOpen}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-foreground pr-2">{item.q}</span>
                    <span
                      className={cn(
                        "mt-2 block text-sm leading-relaxed text-muted-foreground overflow-hidden transition-all",
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 mt-0"
                      )}
                    >
                      {item.a}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 size-5 shrink-0 text-primary transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
