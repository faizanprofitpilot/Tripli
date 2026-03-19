"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getDestinationSuggestions } from "@/app/actions/trips";

interface DestinationInputProps {
  value: string;
  onChange: (value: string, placeId?: string | null) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

const DEBOUNCE_MS = 300;

export function DestinationInput({
  value,
  onChange,
  placeholder = "e.g. New York, Paris",
  id = "destination",
  disabled,
}: DestinationInputProps) {
  const [suggestions, setSuggestions] = useState<{ name: string; place_id: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v, null);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), DEBOUNCE_MS);
  };

  const handleSelect = (name: string, placeId: string) => {
    onChange(name, placeId);
    setSuggestions([]);
    setOpen(false);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <Label htmlFor={id} className="sr-only">
        Destination
      </Label>
      {/* Primary destination field — light bg, strong focus, soft glow */}
      <div className="flex items-center gap-3 w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3.5 min-h-[56px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:border-primary focus-within:shadow-[0_0_0_4px_var(--primary)/0.12] focus-within:bg-white">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id={id}
          name="destination"
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-[17px]"
          aria-describedby={open ? "destination-suggestions" : undefined}
          aria-label="Destination"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id="destination-suggestions"
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-popover py-1 shadow-card"
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              role="option"
              tabIndex={0}
              className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 flex items-center gap-2 rounded-lg mx-1 transition-smooth"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s.name, s.place_id);
              }}
            >
              <Search className="size-4 text-muted-foreground shrink-0" />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      {loading && value.length >= 2 && (
        <p className="text-xs text-muted-foreground px-1">Searching…</p>
      )}
    </div>
  );
}
