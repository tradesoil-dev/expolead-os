// Shared button styles so the main "+ Add" action looks the same on every page:
// a green pill, 40px tall, 14px semibold text.
export const ADD_BUTTON =
  "inline-flex h-10 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700";

// The quieter partner button (Cancel, Back), same size and shape.
export const SECONDARY_BUTTON =
  "inline-flex h-10 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50";

// Same shape when the action is locked (trial ended).
export const ADD_BUTTON_LOCKED =
  "inline-flex h-10 items-center gap-1.5 rounded-full bg-ink-100 px-4 text-sm font-medium text-ink-400";
