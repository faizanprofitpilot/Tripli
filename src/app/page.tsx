import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingItinerarySnippet } from "@/components/landing/LandingItinerarySnippet";
import { SampleItineraryPreview } from "@/components/landing/SampleItineraryPreview";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { getSessionUser } from "@/lib/supabase/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen flex flex-col page-bg">
      <Navbar />
      <main className="flex-1">
        <HeroSection isLoggedIn={!!user} />
        <LandingItinerarySnippet />
        <SampleItineraryPreview />
        <FeatureSection />
        <HowItWorksSection />
        <PricingSection showCheckout={!!user} />
        <FaqSection />
        <FinalCtaSection isLoggedIn={!!user} />
      </main>
    </div>
  );
}
