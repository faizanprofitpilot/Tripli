"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import { getDestinationSuggestions } from "@/app/actions/trips";

const DEBOUNCE_MS = 300;

export function HeroDestinationBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; place_id: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getDestinationSuggestions(query);
      setSuggestions(list);
      setOpen(list.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onChange = (v: string, pid: string | null = null) => {
    setValue(v);
    setPlaceId(pid);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), DEBOUNCE_MS);
  };

  function goToPlan() {
    const q = value.trim();
    if (!q) return;
    const params = new URLSearchParams();
    params.set("destination", q);
    if (placeId) params.set("placeId", placeId);
    router.push(`/plan?${params.toString()}`);
  }

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
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

  return (
    <div ref={wrapRef} className="mt-10 max-w-xl mx-auto text-left relative">
      <label htmlFor="hero-destination" className="sr-only">
        Where do you want to go?
      </label>
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
        <div className="flex flex-1 items-center gap-2 min-w-0 px-3">
          <MapPin className="size-5 shrink-0 text-primary" />
          <input
            id="hero-destination"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value, null)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && goToPlan()}
            placeholder="Where do you want to go?"
            autoComplete="off"
            className="w-full min-w-0 bg-transparent py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={goToPlan}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-primary hover:opacity-95 transition-smooth"
        >
          Go
          <ArrowRight className="size-4" />
        </button>
      </div>
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white py-1 shadow-lg max-h-56 overflow-auto"
          role="listbox"
        >
          {suggestions.map((s) => (
            <li key={s.place_id} role="option">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-800 hover:bg-primary/5"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s.name, s.place_id);
                  setSuggestions([]);
                  setOpen(false);
                }}
              >
                <MapPin className="size-4 shrink-0 text-slate-400" />
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && value.length >= 2 && (
        <p className="mt-2 text-xs text-slate-500 px-1">Searching…</p>
      )}
    </div>
  );
}
