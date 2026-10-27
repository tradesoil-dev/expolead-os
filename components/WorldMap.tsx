import { WORLD_DOTS, WORLD_STEP, WORLD_TOP } from "@/lib/geo/world-map";
import { countryPosition } from "@/lib/geo/country";

// Dotted world map with an emerald bubble per country, sized by value, and a
// soft pulse ring (.map-pulse in globals.css). Pure SVG, no client JS, so it
// renders on the server for the Dashboard and inside the client Reports view.

const CELL = 6; // px per grid cell in the SVG
const COLS = WORLD_DOTS[0]?.length ?? 120;
const W = COLS * CELL;
const H = WORLD_DOTS.length * CELL;

const LAND = (() => {
  const dots: string[] = [];
  WORLD_DOTS.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) if (row[c] === "1") dots.push(`M${c * CELL + CELL / 2 - 1.9},${r * CELL + CELL / 2}a1.9,1.9 0 1,0 3.8,0a1.9,1.9 0 1,0 -3.8,0`);
  });
  return dots.join("");
})();

const x = (lon: number) => ((lon + 180) / WORLD_STEP) * CELL;
const y = (lat: number) => ((WORLD_TOP - lat) / WORLD_STEP) * CELL;

export type MapPoint = { country: string; value: number; label: string };

export default function WorldMap({ points, ariaLabel }: { points: MapPoint[]; ariaLabel: string }) {
  const placed = points
    .map((p) => ({ ...p, pos: countryPosition(p.country) }))
    .filter((p): p is MapPoint & { pos: [number, number] } => !!p.pos && p.value > 0)
    .sort((a, b) => b.value - a.value);
  const max = placed[0]?.value ?? 1;
  const top = placed[0];
  // Keep the label inside the map: flip it left near the right edge.
  const labelLeft = top ? x(top.pos[1]) > W - 170 : false;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel} className="block">
      <path d={LAND} fill="#dfe6e2" />
      {placed.map((p, i) => {
        const r = 4 + Math.sqrt(p.value / max) * 9;
        const cx = x(p.pos[1]);
        const cy = y(p.pos[0]);
        return (
          <g key={p.country}>
            <circle className="map-pulse" style={{ animationDelay: `${(i * 0.35) % 2.6}s` }} cx={cx} cy={cy} r={r} fill="#10b981" />
            <circle cx={cx} cy={cy} r={r} fill="#10b981" fillOpacity={0.62} stroke="#fff" strokeWidth={1.5}>
              <title>{`${p.country}: ${p.label}`}</title>
            </circle>
          </g>
        );
      })}
      {top && (
        <g transform={`translate(${labelLeft ? x(top.pos[1]) - 160 : x(top.pos[1]) + 18},${Math.max(4, y(top.pos[0]) - 36)})`}>
          <rect width="142" height="40" rx="9" fill="#fff" stroke="#e2e8f0" />
          <text x="10" y="16" fontSize="10.5" fill="#94a3b8">{top.country.length > 22 ? `${top.country.slice(0, 21)}…` : top.country}</text>
          <text x="10" y="31" fontSize="12.5" fontWeight="600" fill="#0f172a">{top.label}</text>
        </g>
      )}
    </svg>
  );
}
