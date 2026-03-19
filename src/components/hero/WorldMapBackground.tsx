import { WORLD_MAP_PATH_D } from "@/components/hero/world-map-paths";

/**
 * Real world land outline (Natural Earth 110m, public domain).
 */
export function WorldMapBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden select-none"
      aria-hidden
    >
      <div className="flex h-[min(88vh,980px)] w-[min(165vw,2400px)] max-w-none -translate-y-16 items-center justify-center sm:-translate-y-24 sm:h-[min(92vh,1040px)] sm:w-[min(175vw,2600px)] lg:-translate-y-32 lg:h-[min(96vh,1120px)] lg:w-[min(185vw,2800px)]">
        <svg
          className="hero-map-svg h-full w-full max-h-full max-w-full shrink-0 text-slate-500 dark:text-slate-400"
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <title>World map</title>
          <path
            d={WORLD_MAP_PATH_D}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.55}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="opacity-[0.42] dark:opacity-[0.34]"
          />
        </svg>
      </div>
    </div>
  );
}
