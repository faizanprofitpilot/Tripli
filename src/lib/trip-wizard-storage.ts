/** Serializable wizard draft (matches planner / generateTrip fields). */
export const TRIPLI_WIZARD_DRAFT_KEY = "tripli_wizard_draft";

export interface TripWizardDraft {
  destination: string;
  destinationPlaceId: string | null;
  days: number;
  budget: string;
  customBudget: string;
  travelGroup: string;
  pace: string;
  interests: string[];
  dietary: string[];
}

export function loadWizardDraft(): TripWizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TRIPLI_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TripWizardDraft;
    if (!parsed || typeof parsed.destination !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWizardDraft(draft: TripWizardDraft): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRIPLI_WIZARD_DRAFT_KEY, JSON.stringify(draft));
}

export function clearWizardDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TRIPLI_WIZARD_DRAFT_KEY);
}
