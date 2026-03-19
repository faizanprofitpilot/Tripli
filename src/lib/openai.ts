import OpenAI from "openai";
import type { AIItinerary } from "@/types/trip";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

const ITINERARY_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    trip_title: { type: "string" },
    destination_summary: { type: "string" },
    recommended_hotel: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        neighborhood: { type: "string" },
        price_range: { type: "string" },
        rationale: { type: "string" },
      },
      required: ["name", "neighborhood", "price_range", "rationale"],
      additionalProperties: false,
    },
    days: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          day: { type: "number" },
          theme: { type: "string" },
          activities: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["activity", "restaurant"] },
                slot: { type: "string", enum: ["morning", "lunch", "afternoon", "dinner", "evening"] },
                duration_minutes: { type: "number" },
                rationale: { type: "string" },
              },
              required: ["name", "type", "slot", "duration_minutes", "rationale"],
              additionalProperties: false,
            },
          },
        },
        required: ["day", "theme", "activities"],
        additionalProperties: false,
      },
    },
    cost_estimate: {
      type: "object" as const,
      properties: {
        hotel_total: { type: "number" },
        food_total: { type: "number" },
        activities_total: { type: "number" },
        transportation_total: { type: "number" },
        total: { type: "number" },
      },
      required: ["hotel_total", "food_total", "activities_total", "transportation_total", "total"],
      additionalProperties: false,
    },
  },
  required: ["trip_title", "destination_summary", "recommended_hotel", "days", "cost_estimate"],
  additionalProperties: false,
};

export async function generateItinerary(prompt: string): Promise<AIItinerary> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert travel planner. Generate a complete multi-day itinerary as valid JSON only.
The user will specify exactly one destination city. You MUST plan the entire itinerary (trip_title, destination_summary, hotel, every activity and restaurant) for that city only. Never substitute a different city.
Each day must include exactly: morning (activity), lunch (restaurant), afternoon (activity), dinner (restaurant), and optionally evening (activity).
Use real, well-known places when possible. Return only the JSON object, no markdown or explanation.`,
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "itinerary",
        strict: true,
        schema: ITINERARY_JSON_SCHEMA,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");
  return JSON.parse(raw) as AIItinerary;
}

const DAY_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    day: { type: "number" },
    theme: { type: "string" },
    activities: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["activity", "restaurant"] },
          slot: { type: "string", enum: ["morning", "lunch", "afternoon", "dinner", "evening"] },
          duration_minutes: { type: "number" },
          rationale: { type: "string" },
        },
        required: ["name", "type", "slot", "duration_minutes", "rationale"],
        additionalProperties: false,
      },
    },
  },
  required: ["day", "theme", "activities"],
  additionalProperties: false,
};

export async function regenerateDayItinerary(prompt: string): Promise<{ day: number; theme?: string; activities: AIItinerary["days"][0]["activities"] }> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert travel planner. Generate a single day's itinerary as valid JSON only.
Include: morning (activity), lunch (restaurant), afternoon (activity), dinner (restaurant), optional evening (activity).
Use real, well-known places. Return only the JSON object.`,
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "day_itinerary",
        strict: true,
        schema: DAY_JSON_SCHEMA,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");
  return JSON.parse(raw);
}
