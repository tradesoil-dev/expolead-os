// Client-safe constants for the workspace quantity unit. Kept separate from
// quantity-unit.ts (which imports the server Supabase client) so client
// components can use these without pulling next/headers into the bundle.

// The units a workspace can measure deal quantity in. MT suits bulk commodities
// (chemicals, oils, grains); the rest open the product to packaged goods,
// apparel, machinery, and other product trade.
export const QUANTITY_UNITS = [
  { value: "MT", label: "MT (metric tonnes)" },
  { value: "kg", label: "kg (kilograms)" },
  { value: "units", label: "Units" },
  { value: "pieces", label: "Pieces" },
  { value: "cartons", label: "Cartons" },
  { value: "containers", label: "Containers" },
];

export const DEFAULT_QUANTITY_UNIT = "MT";
