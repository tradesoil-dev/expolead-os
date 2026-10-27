import { createServiceClient } from "@/lib/supabase/service";
import { CAMPAIGNS, type Campaign } from "@/lib/survey-v2";

// Public survey campaigns (one per show). Since migration 0058 they live in
// the server-only survey_campaigns table and are managed from Admin > Feedback.
// The code list in lib/survey-v2.ts stays as a fallback, so the live survey
// keeps working if the table is missing or the database is unreachable.

export type CampaignRow = Campaign & { hasAssets: boolean; createdAt: string | null };

const FALLBACK: Record<string, CampaignRow> = Object.fromEntries(
  Object.values(CAMPAIGNS).map((c) => [c.slug, { ...c, hasAssets: c.slug === "sial-paris-2026", createdAt: null }]),
);

export async function getCampaigns(): Promise<Record<string, CampaignRow>> {
  try {
    const { data, error } = await createServiceClient()
      .from("survey_campaigns")
      .select("slug, exhibition, label, open, has_assets, created_at")
      .order("created_at", { ascending: false });
    if (error || !data) return FALLBACK;
    const out: Record<string, CampaignRow> = {};
    for (const r of data) {
      out[r.slug] = { slug: r.slug, exhibition: r.exhibition, label: r.label, open: !!r.open, hasAssets: !!r.has_assets, createdAt: r.created_at };
    }
    // Keep a code-only campaign visible until it is saved in the table.
    for (const [slug, c] of Object.entries(FALLBACK)) if (!out[slug]) out[slug] = c;
    return out;
  } catch {
    return FALLBACK;
  }
}

export async function getCampaign(slug: string): Promise<CampaignRow | null> {
  const all = await getCampaigns();
  return all[slug] ?? null;
}

/** The link-preview image for a survey: its own card if one was made, else the site card. */
export function campaignImage(c: Pick<CampaignRow, "slug" | "hasAssets">): string {
  return c.hasAssets ? `https://expoleados.com/og/${c.slug}-survey.png` : "https://expoleados.com/og.png";
}

/** "Gulfood 2027" -> "gulfood-2027". */
export function slugify(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
