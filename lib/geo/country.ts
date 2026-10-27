import { COUNTRY_CENTROIDS } from "@/lib/geo/world-map";

// Country is free text on a connection (the form suggests names from
// lib/countries.ts but anything can be typed), so match loosely: case and
// spacing are ignored and common short forms are mapped to the full name.
const ALIASES: Record<string, string> = {
  uae: "United Arab Emirates",
  "u.a.e": "United Arab Emirates",
  emirates: "United Arab Emirates",
  dubai: "United Arab Emirates",
  "abu dhabi": "United Arab Emirates",
  usa: "United States",
  us: "United States",
  "u.s.a": "United States",
  "united states of america": "United States",
  america: "United States",
  uk: "United Kingdom",
  "u.k": "United Kingdom",
  "great britain": "United Kingdom",
  britain: "United Kingdom",
  england: "United Kingdom",
  scotland: "United Kingdom",
  wales: "United Kingdom",
  ksa: "Saudi Arabia",
  saudi: "Saudi Arabia",
  holland: "Netherlands",
  "the netherlands": "Netherlands",
  korea: "South Korea",
  "republic of korea": "South Korea",
  russia: "Russia",
  "russian federation": "Russia",
  turkiye: "Turkey",
  "türkiye": "Turkey",
  "czech republic": "Czechia",
  "côte d'ivoire": "Ivory Coast",
  "cote d'ivoire": "Ivory Coast",
  "hong kong sar": "Hong Kong",
  prc: "China",
  "mainland china": "China",
  vietnam: "Vietnam",
  "viet nam": "Vietnam",
};

const BY_KEY = new Map<string, string>(
  Object.keys(COUNTRY_CENTROIDS).map((name) => [name.toLowerCase(), name]),
);

/** The canonical country name for a free-text country, or null if unknown. */
export function canonicalCountry(raw: string | null | undefined): string | null {
  const k = (raw ?? "").toLowerCase().replace(/\s+/g, " ").replace(/\.$/, "").trim();
  if (!k) return null;
  const alias = ALIASES[k];
  if (alias && COUNTRY_CENTROIDS[alias]) return alias;
  return BY_KEY.get(k) ?? null;
}

/** [lat, lon] for a canonical country name. */
export function countryPosition(name: string): [number, number] | null {
  return COUNTRY_CENTROIDS[name] ?? null;
}
