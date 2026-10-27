// Shared button styles so the main "+ Add" action looks the same on every page:
// a green pill, 40px tall, 14px semibold text.
export const ADD_BUTTON =
  "inline-flex h-10 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700";

// Same shape when the action is locked (trial ended).
export const ADD_BUTTON_LOCKED =
  "inline-flex h-10 items-center gap-1.5 rounded-full bg-ink-100 px-4 text-sm font-medium text-ink-400";
