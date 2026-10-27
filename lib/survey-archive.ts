import { ALL_QUESTIONS, optionLabel, type Answers } from "@/lib/survey-v2";

// Anonymised survey archive (Privacy Notice section 9: survey answers and
// contact details are deleted after 24 months). Before deleting, the admin
// downloads this file: it keeps the answers and drops everything that can
// identify a person (name, email, company, WhatsApp, LinkedIn, IP data, exact
// date). It can be uploaded again later to keep learning from the answers.

export const ARCHIVE_FORMAT = "expolead-survey-archive-v1";
export const RETENTION_MONTHS = 24;

export const ARCHIVE_HEADERS = ["Format", "Campaign", "Channel", "Role", "Answered month", "Answers (JSON)", ...ALL_QUESTIONS.map((q) => q.label)];

export type ArchiveRow = { campaign: string; source: string | null; role: string; month: string; answers: Answers };

export function archiveCsvRow(r: ArchiveRow): unknown[] {
  return [
    ARCHIVE_FORMAT,
    r.campaign,
    r.source ?? "",
    r.role,
    r.month,
    JSON.stringify(r.answers),
    ...ALL_QUESTIONS.map((q) => {
      const v = (r.answers as Record<string, unknown>)[q.id];
      return Array.isArray(v) ? v.map((x) => optionLabel(q.id, x)).join(", ") : optionLabel(q.id, v);
    }),
  ];
}

/** The date before which answers are past the retention period. */
export function retentionCutoff(now = new Date()): Date {
  const d = new Date(now);
  d.setMonth(d.getMonth() - RETENTION_MONTHS);
  return d;
}
