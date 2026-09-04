// Normalise an admin-entered URL to an absolute https URL, or null if empty.
// So "gulfood.com" becomes "https://gulfood.com" and links never resolve as
// relative paths. Leaves an existing http/https scheme untouched.
export function ensureHttps(url: string | null | undefined): string | null {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}
