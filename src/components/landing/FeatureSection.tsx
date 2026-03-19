import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    title: "A full trip, fast",
    description:
      "Hotel, daily stops, where to eat, and rough costs — not a blank doc you fill in for hours.",
  },
  {
    title: "Real places you can book",
    description:
      "Names, areas, and map-ready spots so you’re not guessing from vague “explore the city.”",
  },
  {
    title: "Tweak without starting over",
    description:
      "Swap a hotel or one afternoon. Regenerate a single day and keep the rest.",
  },
  {
    title: "See it on a map",
    description:
      "Your hotel and every stop, day by day — so the route actually makes sense.",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center sm:text-4xl">
          What you get
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto text-lg">
          Less time on spreadsheets. More time counting down to takeoff.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group rounded-[var(--radius-card-lg)] border border-slate-200 bg-white shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-smooth"
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 text-lg">{f.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
