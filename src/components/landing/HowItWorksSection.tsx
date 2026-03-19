const STEPS = [
  {
    step: 1,
    title: "Say where & how long",
    body: "City or region, number of days, budget vibe, who’s coming, what you like — the usual trip questions, quick.",
  },
  {
    step: 2,
    title: "Get the whole outline",
    body: "One pass gives you somewhere to stay, a rhythm for each day, meals that fit, and a sense of cost.",
  },
  {
    step: 3,
    title: "Adjust if you want",
    body: "Change a night, swap an activity, or redo one day. Or take it as-is and start booking.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 text-center text-slate-600 text-lg">
          Three steps from “we should go” to a trip you can picture.
        </p>
        <div className="mt-14 space-y-10">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-5 items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-soft">
                {s.step}
              </div>
              <div className="pt-0.5">
                <h3 className="font-semibold text-slate-900 text-lg">{s.title}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
