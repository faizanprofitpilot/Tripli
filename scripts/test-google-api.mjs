#!/usr/bin/env node
/**
 * Test script for Google Places API (and env).
 * Run: node scripts/test-google-api.mjs
 * Or: npm run test:google-api
 *
 * Reads .env.local from project root. Requires Node 18+ (fetch).
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("No .env.local found at", envPath);
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

const env = loadEnv();
const apiKey =
  env.GOOGLE_PLACES_API_KEY ||
  env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error("Missing API key. Set GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local");
  process.exit(1);
}

console.log("Using API key:", apiKey.slice(0, 8) + "..." + apiKey.slice(-4));
console.log("");

// 1. Places API (New) - searchText
console.log("1. Testing Places API (New) - searchText...");
try {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: "Paris", maxResultCount: 2 }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("   FAIL:", res.status, text);
  } else {
    const data = JSON.parse(text);
    const places = data.places || [];
    console.log("   OK – got", places.length, "place(s)");
    places.forEach((p, i) => {
      console.log("   ", i + 1 + ".", p.displayName?.text || p.id);
    });
  }
} catch (e) {
  console.error("   ERROR:", e.message);
}

console.log("");

// 2. Maps JavaScript API (script load) - can't run in Node, so we just note it
console.log("2. Maps JavaScript API (destination autocomplete)");
console.log("   This runs in the browser. If the app shows 'This page can't load");
console.log("   Google Maps correctly', check:");
console.log("   - HTTP referrer restriction includes http://localhost:3000/*");
console.log("   - Maps JavaScript API and Places API (classic) are enabled");
console.log("   - Billing is enabled on the Google Cloud project");
console.log("");

console.log("Done.");
