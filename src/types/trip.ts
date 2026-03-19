import { z } from "zod";

// --- Preferences (planner form) ---
export const BUDGET_OPTIONS = ["low", "medium", "high", "custom"] as const;
export const TRAVEL_GROUP_OPTIONS = ["solo", "couple", "family", "friends"] as const;
export const INTEREST_OPTIONS = [
  "city_sightseeing",
  "food_exploration",
  "nightlife",
  "shopping",
  "outdoor_adventures",
  "beaches",
  "museums_culture",
  "relaxation_spa",
] as const;
export const DIETARY_OPTIONS = ["halal", "vegetarian", "kosher"] as const;
export const PACE_OPTIONS = ["relaxed", "balanced", "packed"] as const;

export const preferencesSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  destinationPlaceId: z.string().optional().nullable(),
  days: z.number().min(1).max(14),
  budget: z.enum(BUDGET_OPTIONS),
  customBudget: z.number().positive().optional(),
  travelGroup: z.enum(TRAVEL_GROUP_OPTIONS),
  interests: z.array(z.enum(INTEREST_OPTIONS)),
  dietary: z.array(z.enum(DIETARY_OPTIONS)).optional().default([]),
  pace: z.enum(PACE_OPTIONS),
});

export type Preferences = z.infer<typeof preferencesSchema>;

// --- AI-generated itinerary (structured output) ---
export const costEstimateSchema = z.object({
  hotel_total: z.number(),
  food_total: z.number(),
  activities_total: z.number(),
  transportation_total: z.number(),
  total: z.number(),
});

export const activitySchema = z.object({
  name: z.string(),
  type: z.enum(["activity", "restaurant"]),
  slot: z.enum(["morning", "lunch", "afternoon", "dinner", "evening"]),
  duration_minutes: z.number(),
  rationale: z.string().optional(),
});

export const daySchema = z.object({
  day: z.number(),
  theme: z.string().optional(),
  activities: z.array(activitySchema),
});

export const recommendedHotelSchema = z.object({
  name: z.string(),
  neighborhood: z.string(),
  price_range: z.string(),
  rationale: z.string().optional(),
});

export const aiItinerarySchema = z.object({
  trip_title: z.string(),
  destination_summary: z.string(),
  recommended_hotel: recommendedHotelSchema,
  days: z.array(daySchema),
  cost_estimate: costEstimateSchema,
});

export type CostEstimate = z.infer<typeof costEstimateSchema>;
export type ActivityItem = z.infer<typeof activitySchema>;
export type DayItinerary = z.infer<typeof daySchema>;
export type RecommendedHotel = z.infer<typeof recommendedHotelSchema>;
export type AIItinerary = z.infer<typeof aiItinerarySchema>;

// --- Resolved place (after Google Places) ---
export interface ResolvedPlace {
  place_id: string;
  name: string;
  address: string | null;
  rating: number | null;
  lat: number;
  lng: number;
  photo_url: string | null;
  google_maps_uri?: string | null;
}

// --- DB / API trip shape (for trip page) ---
export interface TripHotel {
  id: string;
  trip_id: string;
  place_id: string | null;
  name: string;
  address: string | null;
  rating: number | null;
  price_range: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  rationale: string | null;
  google_maps_url?: string | null;
}

export interface TripItem {
  id: string;
  trip_day_id: string;
  slot: string;
  place_id: string | null;
  name: string;
  category: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  photo_url: string | null;
  duration_minutes: number | null;
  description: string | null;
  rationale: string | null;
  google_maps_url?: string | null;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  theme: string | null;
  items: TripItem[];
}

export interface Trip {
  id: string;
  user_id: string | null;
  destination: string;
  destination_place_id: string | null;
  destination_image_url: string | null;
  days_count: number;
  budget: string;
  travel_group: string;
  interests: string[];
  dietary: string[];
  pace: string;
  title: string | null;
  summary: string | null;
  cost_estimate: CostEstimate | null;
  created_at: string;
  hotel: TripHotel | null;
  days: TripDay[];
}
