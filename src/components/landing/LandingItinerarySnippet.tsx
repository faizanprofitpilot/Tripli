import Image from "next/image";

export function LandingItinerarySnippet() {
  return (
    <section id="preview" className="px-4 py-12 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            What your trip looks like
          </h2>
          <p className="mt-2 text-slate-600 max-w-lg mx-auto">
            Real places, real times — the kind of plan you actually use on the ground.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200/80 bg-white">
          <Image
            src="/Landing illustration.png"
            alt="What your trip looks like — sample itinerary with hotel, activities, and map"
            width={1200}
            height={720}
            className="w-full h-auto object-contain"
            priority={false}
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
