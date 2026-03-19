"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  PiggyBank,
  Banknote,
  Sparkles,
  Gem,
  Calculator,
  User,
  Heart,
  Users,
  UsersRound,
  Leaf,
  Gauge,
  Zap,
  Landmark,
  UtensilsCrossed,
  Moon,
  ShoppingBag,
  Trees,
  Waves,
  Building2,
  Beef,
  Salad,
  Star,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { generateTrip, getDestinationSuggestions } from "@/app/actions/trips";
import { saveWizardDraft, type TripWizardDraft } from "@/lib/trip-wizard-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BUDGET_OPTIONS,
  TRAVEL_GROUP_OPTIONS,
  INTEREST_OPTIONS,
  DIETARY_OPTIONS,
  PACE_OPTIONS,
} from "@/types/trip";
import { TripGeneratingOverlay } from "@/components/planner/TripGeneratingOverlay";
import { SubscriptionGateDialog } from "@/components/billing/SubscriptionGateDialog";

const DEBOUNCE_MS = 300;

const BUDGET_LABELS: Record<(typeof BUDGET_OPTIONS)[number], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  custom: "Custom",
};

const INTEREST_LABELS: Record<(typeof INTEREST_OPTIONS)[number], string> = {
  city_sightseeing: "Sightseeing",
  food_exploration: "Food",
  nightlife: "Nightlife",
  shopping: "Shopping",
  outdoor_adventures: "Outdoors",
  beaches: "Beaches",
  museums_culture: "Museums",
  relaxation_spa: "Spa",
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

const BUDGET_ICONS: Record<(typeof BUDGET_OPTIONS)[number], React.ComponentType<{ className?: string }>> = {
  low: PiggyBank,
  medium: Banknote,
  high: Gem,
  custom: Calculator,
};

const TRAVEL_GROUP_ICONS: Record<(typeof TRAVEL_GROUP_OPTIONS)[number], React.ComponentType<{ className?: string }>> = {
  solo: User,
  couple: Heart,
  family: Users,
  friends: UsersRound,
};

const PACE_ICONS: Record<(typeof PACE_OPTIONS)[number], React.ComponentType<{ className?: string }>> = {
  relaxed: Leaf,
  balanced: Gauge,
  packed: Zap,
};

const STEP_COUNT = 8;

function ChoiceCard({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-row items-center justify-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold transition-all duration-200",
        active
          ? "border-primary bg-primary/10 text-foreground shadow-sm [&_.wizard-option-icon]:bg-primary/20 [&_.wizard-option-icon]:text-primary"
          : "border-slate-200 bg-white text-slate-800 hover:border-primary/40 hover:bg-slate-50 [&_.wizard-option-icon]:bg-slate-100 [&_.wizard-option-icon]:text-slate-600"
      )}
    >
      <span className="wizard-option-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">{children}</span>
    </button>
  );
}

export function TripPlanWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [subscriptionGateOpen, setSubscriptionGateOpen] = useState(false);

  const [destination, setDestination] = useState("");
  const [destinationPlaceId, setDestinationPlaceId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; place_id: string }[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<string>("medium");
  const [customBudget, setCustomBudget] = useState("");
  const [travelGroup, setTravelGroup] = useState<string>("couple");
  const [pace, setPace] = useState<string>("balanced");
  const [interests, setInterests] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);

  const draft = useMemo(
    (): TripWizardDraft => ({
      destination: destination.trim(),
      destinationPlaceId,
      days,
      budget,
      customBudget,
      travelGroup,
      pace,
      interests,
      dietary,
    }),
    [destination, destinationPlaceId, days, budget, customBudget, travelGroup, pace, interests, dietary]
  );

  useEffect(() => {
    const dest = searchParams.get("destination")?.trim() ?? "";
    const pid = searchParams.get("placeId")?.trim() ?? null;
    if (dest) setDestination(decodeURIComponent(dest));
    if (pid) setDestinationPlaceId(pid);
  }, [searchParams]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    saveWizardDraft(draft);
  }, [draft]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestLoading(true);
    try {
      const list = await getDestinationSuggestions(query);
      setSuggestions(list);
      setSuggestOpen(list.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const onDestChange = (v: string, placeId: string | null = null) => {
    setDestination(v);
    setDestinationPlaceId(placeId);
    setSuggestOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), DEBOUNCE_MS);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const progressPct = Math.round(((step + 1) / STEP_COUNT) * 100);

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return destination.trim().length > 0;
      case 1:
        return days >= 1 && days <= 14;
      case 2:
        if (budget === "custom") {
          const n = Number(customBudget);
          return !!customBudget && !isNaN(n) && n > 0;
        }
        return true;
      default:
        return true;
    }
  }, [step, destination, days, budget, customBudget]);

  const goNext = () => {
    if (!canNext) return;
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const toggleInterest = (v: string) => {
    setInterests((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  };

  const toggleDietary = (v: string) => {
    setDietary((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  };

  async function runGenerate() {
    setGenError(null);
    setSubscriptionGateOpen(false);
    const fd = new FormData();
    fd.set("destination", draft.destination);
    if (draft.destinationPlaceId) fd.set("destinationPlaceId", draft.destinationPlaceId);
    fd.set("days", String(draft.days));
    fd.set("budget", draft.budget);
    if (draft.budget === "custom") fd.set("customBudget", String(Number(draft.customBudget)));
    fd.set("travelGroup", draft.travelGroup);
    fd.set("interests", JSON.stringify(draft.interests));
    fd.set("dietary", JSON.stringify(draft.dietary));
    fd.set("pace", draft.pace);
    setGenerating(true);
    try {
      const result = await generateTrip(fd);
      if (result?.tripId) {
        router.push(`/trip/${result.tripId}`);
        return;
      }
      if (result?.requiresSubscription) {
        setSubscriptionGateOpen(true);
        return;
      }
      if (result?.error) setGenError(result.error);
    } finally {
      setGenerating(false);
    }
  }

  const signupRedirect = "/plan/complete";
  const signupHref = `/signup?redirect=${encodeURIComponent(signupRedirect)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(signupRedirect)}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      <SubscriptionGateDialog open={subscriptionGateOpen} onOpenChange={setSubscriptionGateOpen} />
      {generating && <TripGeneratingOverlay />}
      {/* Progress — bar centered; nav control absolutely positioned */}
      <div className="relative shrink-0 border-b border-slate-100 bg-white py-2.5 sm:py-3">
        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
            >
              ✕
            </Link>
          )}
        </div>
        <div className="mx-auto w-full max-w-md px-14 text-center sm:max-w-lg sm:px-16">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Step {step + 1} of {STEP_COUNT}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* One question — scroll if needed on short viewports */}
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Where are you headed?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">City or place — same suggestions as the planner.</p>
              <div ref={wrapRef} className="relative mt-5 w-full max-w-md">
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-[#f8fafc] px-3 py-2.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <MapPin className="size-5 shrink-0 text-primary" />
                  <input
                    name="destination"
                    value={destination}
                    onChange={(e) => onDestChange(e.target.value, null)}
                    onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                    placeholder="e.g. Paris, Tokyo, Bali"
                    className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                    autoComplete="off"
                  />
                </div>
                {suggestOpen && suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {suggestions.map((s) => (
                      <li key={s.place_id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-800 hover:bg-primary/5"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onDestChange(s.name, s.place_id);
                            setSuggestions([]);
                            setSuggestOpen(false);
                          }}
                        >
                          <MapPin className="size-4 shrink-0 text-muted-foreground" />
                          {s.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {suggestLoading && destination.length >= 2 && (
                  <p className="mt-2 text-xs text-slate-500">Searching…</p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Trip length?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">1–14 days.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {[3, 5, 7, 10, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all sm:text-sm",
                      days === d
                        ? "border-primary bg-primary/10 text-foreground [&_.day-chip-icon]:text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/30 [&_.day-chip-icon]:text-slate-500"
                    )}
                  >
                    <CalendarDays className="day-chip-icon size-3.5 shrink-0 sm:size-4" />
                    <span>{d}d</span>
                  </button>
                ))}
              </div>
              <div className="mx-auto mt-4 w-full max-w-[11rem]">
                <label className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                  <CalendarDays className="size-3.5 text-slate-500 sm:size-4" />
                  Other (days)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Math.min(14, Math.max(1, Number(e.target.value) || 1)))}
                  className="mt-1.5 h-10 rounded-xl border-slate-200 text-center text-base"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Budget?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">Hotels & dining follow this.</p>
              <div className="mt-5 w-full max-w-sm space-y-2">
                {BUDGET_OPTIONS.map((b) => {
                  const Icon = BUDGET_ICONS[b];
                  return (
                    <div key={b}>
                      <ChoiceCard
                        active={budget === b}
                        onClick={() => setBudget(b)}
                        icon={Icon}
                      >
                        {BUDGET_LABELS[b]}
                      </ChoiceCard>
                    </div>
                  );
                })}
                {budget === "custom" && (
                  <div className="pt-1">
                    <label className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                      <Banknote className="size-3.5 text-slate-500 sm:size-4" />
                      USD
                    </label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1200"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      className="mt-1.5 h-10 rounded-xl text-center text-base"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Who&apos;s going?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">Travel group</p>
              <div className="mt-5 w-full max-w-sm space-y-2">
                {TRAVEL_GROUP_OPTIONS.map((g) => {
                  const Icon = TRAVEL_GROUP_ICONS[g];
                  return (
                    <div key={g}>
                      <ChoiceCard
                        active={travelGroup === g}
                        onClick={() => setTravelGroup(g)}
                        icon={Icon}
                      >
                        <span className="capitalize">{g}</span>
                      </ChoiceCard>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Day pace?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">Relaxed to packed</p>
              <div className="mt-5 w-full max-w-sm space-y-2">
                {PACE_OPTIONS.map((p) => {
                  const Icon = PACE_ICONS[p];
                  return (
                    <div key={p}>
                      <ChoiceCard active={pace === p} onClick={() => setPace(p)} icon={Icon}>
                        <span className="capitalize">{p}</span>
                      </ChoiceCard>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Interests?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">Pick any.</p>
              <div className="mt-5 flex w-full max-w-md flex-wrap justify-center gap-1.5">
                {INTEREST_OPTIONS.map((opt) => {
                  const on = interests.includes(opt);
                  const Icon = INTEREST_ICONS[opt];
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1.5 text-xs font-medium transition-all duration-200 sm:px-3 sm:text-sm",
                        on
                          ? "border-primary/80 bg-primary/15 text-slate-900 [&_svg]:text-primary"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 [&_svg]:text-slate-500"
                      )}
                    >
                      <Icon className="size-3.5 shrink-0 sm:size-4" />
                      {INTEREST_LABELS[opt]}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Dietary?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">Optional.</p>
              <div className="mt-5 flex w-full flex-wrap justify-center gap-1.5">
                {DIETARY_OPTIONS.map((opt) => {
                  const on = dietary.includes(opt);
                  const Icon = DIETARY_ICONS[opt];
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleDietary(opt)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1.5 text-xs font-medium capitalize transition-all duration-200 sm:px-3 sm:text-sm",
                        on
                          ? "border-primary/80 bg-primary/15 text-slate-900 [&_svg]:text-primary"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 [&_svg]:text-slate-500"
                      )}
                    >
                      <Icon className="size-3.5 shrink-0 sm:size-4" />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                All set
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {loggedIn
                  ? "Itinerary, hotel, and map — one tap."
                  : "Sign up free to generate your trip."}
              </p>
              <div className="mt-6 w-full max-w-sm space-y-3">
                {loggedIn ? (
                  <>
                    {genError && (
                      <p className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">{genError}</p>
                    )}
                    <Button
                      type="button"
                      size="lg"
                      className="h-12 w-full rounded-full text-sm font-semibold shadow-primary sm:text-base"
                      onClick={() => void runGenerate()}
                    >
                      Generate trip
                      <ArrowRight className="ml-2 size-4 sm:size-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href={signupHref}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-primary transition-opacity hover:opacity-95 sm:text-base"
                    >
                      Sign up to continue
                      <ArrowRight className="size-4 sm:size-5" />
                    </Link>
                    <p className="text-center text-xs text-slate-500 sm:text-sm">
                      Have an account?{" "}
                      <Link href={loginHref} className="font-semibold text-primary hover:underline">
                        Log in
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </>
          )}

          {step < 7 && (
            <div className="mt-6 w-full max-w-sm pb-2 sm:mt-8">
              <Button
                type="button"
                size="lg"
                disabled={!canNext}
                className="h-12 w-full rounded-full text-sm font-semibold shadow-primary sm:text-base"
                onClick={goNext}
              >
                Continue
                <ArrowRight className="ml-2 size-4 sm:size-5" />
              </Button>
              {step === 6 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-3 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Skip for now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
