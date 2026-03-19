"use client";

import { useState } from "react";
import { useFormStatus, flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Landmark,
  UtensilsCrossed,
  Moon,
  ShoppingBag,
  Trees,
  Waves,
  Building2,
  Sparkles,
  Beef,
  Salad,
  Star,
  CalendarDays,
  Wallet,
  Users,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DestinationInput } from "@/components/planner/DestinationInput";
import { TripGeneratingOverlay } from "@/components/planner/TripGeneratingOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BUDGET_OPTIONS,
  TRAVEL_GROUP_OPTIONS,
  INTEREST_OPTIONS,
  DIETARY_OPTIONS,
  PACE_OPTIONS,
} from "@/types/trip";
import { generateTrip } from "@/app/actions/trips";
import { SubscriptionGateDialog } from "@/components/billing/SubscriptionGateDialog";
import { cn } from "@/lib/utils";

const BUDGET_LABELS: Record<(typeof BUDGET_OPTIONS)[number], string> = {
  low: "Low ($)",
  medium: "Medium ($$)",
  high: "High ($$$)",
  custom: "Custom",
};

const INTEREST_LABELS: Record<(typeof INTEREST_OPTIONS)[number], string> = {
  city_sightseeing: "City sightseeing",
  food_exploration: "Food exploration",
  nightlife: "Nightlife",
  shopping: "Shopping",
  outdoor_adventures: "Outdoor adventures",
  beaches: "Beaches",
  museums_culture: "Museums & culture",
  relaxation_spa: "Relaxation & spa",
};

const INTEREST_ICONS: Record<(typeof INTEREST_OPTIONS)[number], React.ComponentType<{ className?: string }>> = {
  city_sightseeing: Landmark,
  food_exploration: UtensilsCrossed,
  nightlife: Moon,
  shopping: ShoppingBag,
  outdoor_adventures: Trees,
  beaches: Waves,
  museums_culture: Building2,
  relaxation_spa: Sparkles,
};

const DIETARY_ICONS: Record<(typeof DIETARY_OPTIONS)[number], React.ComponentType<{ className?: string }>> = {
  halal: Beef,
  vegetarian: Salad,
  kosher: Star,
};

const SECTION_HEADING_CLASS =
  "text-base font-semibold tracking-tight text-foreground mb-1";
const LABEL_CLASS = "text-sm font-medium text-foreground";
const HELPER_CLASS = "text-xs text-muted-foreground mt-0.5";

/** Inputs: light bg, subtle border, strong focus + soft glow */
const INPUT_STYLE =
  "h-10 rounded-lg border border-slate-200/80 bg-[#f8fafc] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:bg-white focus-visible:shadow-[0_0_0_4px_var(--primary)/0.1]";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-3 text-center">
      <p className="text-xs text-muted-foreground">
        Hotel • Activities • Map included
      </p>
      <Button
        type="submit"
        size="lg"
        disabled={pending || disabled}
        className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_-2px_var(--primary)/0.4] hover:shadow-[0_8px_28px_-4px_var(--primary)/0.45] hover:-translate-y-0.5 px-8 py-6 cursor-pointer active:scale-[0.98] transition-all duration-200"
      >
        {pending ? "Generating your trip…" : "Generate My Trip"}
      </Button>
      <p className={HELPER_CLASS}>
        ⚡ Your full itinerary in ~10 seconds
      </p>
    </div>
  );
}

interface PlannerFormProps {
  className?: string;
  defaultDestination?: string;
}

export function PlannerForm({ className, defaultDestination }: PlannerFormProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultDestination ?? "");
  const [destinationPlaceId, setDestinationPlaceId] = useState<string | null>(null);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<string>("medium");
  const [customBudget, setCustomBudget] = useState<string>("");
  const [travelGroup, setTravelGroup] = useState<string>("couple");
  const [interests, setInterests] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [pace, setPace] = useState<string>("balanced");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subscriptionGateOpen, setSubscriptionGateOpen] = useState(false);

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const toggleDietary = (value: string) => {
    setDietary((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubscriptionGateOpen(false);
    const dest = (formData.get("destination") as string)?.trim() ?? "";
    if (!dest) {
      setError("Destination is required.");
      return;
    }
    if (budget === "custom") {
      const amount = Number(customBudget);
      if (!customBudget || isNaN(amount) || amount <= 0) {
        setError("Please enter a valid custom budget amount (USD).");
        return;
      }
      formData.set("customBudget", String(amount));
    }
    formData.set("destination", dest);
    if (destinationPlaceId) formData.set("destinationPlaceId", destinationPlaceId);
    formData.set("days", String(days));
    formData.set("budget", budget);
    formData.set("travelGroup", travelGroup);
    formData.set("interests", JSON.stringify(interests));
    formData.set("dietary", JSON.stringify(dietary));
    formData.set("pace", pace);

    flushSync(() => setIsGenerating(true));
    try {
      const result = await generateTrip(formData);
      if (result?.tripId) {
        router.push(`/trip/${result.tripId}`);
        return;
      }
      if (result?.requiresSubscription) {
        setSubscriptionGateOpen(true);
        return;
      }
      if (result?.error) setError(result.error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <form action={handleSubmit} className={cn("relative", className)}>
      <SubscriptionGateDialog open={subscriptionGateOpen} onOpenChange={setSubscriptionGateOpen} />
      {isGenerating && <TripGeneratingOverlay />}
      {destinationPlaceId != null && <input type="hidden" name="destinationPlaceId" value={destinationPlaceId} />}

      {/* Destination — primary input */}
      <div className="space-y-2">
        <Label htmlFor="destination" className={LABEL_CLASS}>
          Where do you want to go?
        </Label>
        <DestinationInput
          value={destination}
          onChange={(val, placeId) => {
            setDestination(val);
            setDestinationPlaceId(placeId ?? null);
          }}
        />
      </div>

      {/* Trip basics */}
      <section className="space-y-3 border-t border-slate-200/70 pt-8 mt-10">
        <h2 className={SECTION_HEADING_CLASS}>Trip basics</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="days" className={LABEL_CLASS}>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                Number of days
              </span>
            </Label>
            <Input
              id="days"
              name="days"
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 1)}
              className={INPUT_STYLE}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget" className={LABEL_CLASS}>
              <span className="inline-flex items-center gap-2">
                <Wallet className="size-4 text-muted-foreground shrink-0" />
                Budget
              </span>
            </Label>
            <Select name="budget" value={budget} onValueChange={(v) => v != null && setBudget(v)}>
              <SelectTrigger id="budget" className={cn("w-full cursor-pointer", INPUT_STYLE)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b} className="cursor-pointer">
                    {BUDGET_LABELS[b]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {budget === "custom" && (
              <div className="pt-2 space-y-1">
                <Label htmlFor="customBudget" className={LABEL_CLASS}>Budget amount (USD)</Label>
                <Input
                  id="customBudget"
                  name="customBudget"
                  type="number"
                  min={1}
                  placeholder="e.g. 500"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  className={cn("mt-1", INPUT_STYLE)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Travel style */}
      <section className="space-y-3 border-t border-slate-200/70 pt-8 mt-12">
        <h2 className={SECTION_HEADING_CLASS}>Travel style</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="travelGroup" className={LABEL_CLASS}>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-muted-foreground shrink-0" />
                Travel group
              </span>
            </Label>
            <Select name="travelGroup" value={travelGroup} onValueChange={(v) => v != null && setTravelGroup(v)}>
              <SelectTrigger id="travelGroup" className={cn("w-full", INPUT_STYLE)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRAVEL_GROUP_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pace" className={LABEL_CLASS}>
              <span className="inline-flex items-center gap-2">
                <Gauge className="size-4 text-muted-foreground shrink-0" />
                Trip pace
              </span>
            </Label>
            <Select name="pace" value={pace} onValueChange={(v) => v != null && setPace(v)}>
              <SelectTrigger id="pace" className={cn("w-full", INPUT_STYLE)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PACE_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Interests */}
      <section className="space-y-2.5 border-t border-slate-200/70 pt-8 mt-12">
        <h2 className={SECTION_HEADING_CLASS}>Interests</h2>
        <p className={HELPER_CLASS}>Select all that apply</p>
        <div className="flex flex-wrap gap-2.5">
          {INTEREST_OPTIONS.map((opt) => {
            const Icon = INTEREST_ICONS[opt];
            const selected = interests.includes(opt);
            return (
              <label
                key={opt}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  selected
                    ? "border-primary/90 bg-primary/15 text-slate-800 shadow-sm [&_svg]:text-primary"
                    : "border-slate-200/80 text-muted-foreground [&_svg]:text-muted-foreground"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleInterest(opt)}
                  className="rounded border-input sr-only"
                />
                {Icon && <Icon className="size-4 shrink-0" />}
                {INTEREST_LABELS[opt]}
              </label>
            );
          })}
        </div>
      </section>

      {/* Dietary */}
      <section className="space-y-2.5 border-t border-slate-200/70 pt-8 mt-12">
        <h2 className={cn(SECTION_HEADING_CLASS, "text-muted-foreground font-medium")}>Dietary <span className="font-normal">(optional)</span></h2>
        <div className="flex flex-wrap gap-2.5">
          {DIETARY_OPTIONS.map((opt) => {
            const Icon = DIETARY_ICONS[opt];
            const selected = dietary.includes(opt);
            return (
              <label
                key={opt}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  selected
                    ? "border-primary/90 bg-primary/15 text-slate-800 [&_svg]:text-primary"
                    : "border-slate-200/80 text-muted-foreground [&_svg]:text-muted-foreground"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleDietary(opt)}
                  className="rounded border-input sr-only"
                />
                {Icon && <Icon className="size-4 shrink-0" />}
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </label>
            );
          })}
        </div>
      </section>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-4 font-medium">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6 pt-10 mt-12 border-t border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
          <SubmitButton disabled={isGenerating} />
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200/80 bg-white px-6 text-sm font-medium text-foreground hover:bg-slate-50 cursor-pointer transition-smooth order-first sm:order-none"
          >
            Back
          </Link>
        </div>
      </div>
    </form>
  );
}
