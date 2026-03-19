import { WorldMapBackground } from "@/components/hero/WorldMapBackground";
import { HeroDestinationBar } from "@/components/landing/HeroDestinationBar";
import { HeroCityMarquee } from "@/components/landing/HeroCityMarquee";

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn: _isLoggedIn }: HeroSectionProps) {
  return (
    <section
      id="hero-section"
      className="relative min-h-[520px] overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8 sm:pt-24 sm:pb-20"
    >
      {/* Solid base so blend modes are predictable */}
      <div className="absolute inset-0 z-0 bg-background" />
      <WorldMapBackground />
      <div className="relative z-10 mx-auto max-w-5xl text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.95)] dark:drop-shadow-[0_0_16px_rgba(0,0,0,0.5)]">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
          Tell us where.
          <br />
          <span className="text-primary">We&apos;ll plan everything.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-5xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          Plan your next trip in seconds — hotel, days, meals, and stops in one go.
        </p>

        <HeroDestinationBar />
      </div>

      <div className="relative z-10 mt-12 w-full max-w-[100vw] px-0 sm:mt-14">
        <HeroCityMarquee />
      </div>
    </section>
  );
}
