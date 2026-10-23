// Single source of truth for the post-show check-in survey. Used by the public
// survey page (rendering), the submit route (server-side validation) and the
// admin Feedback page (labels and charts), so they can never drift apart.
//
// To change the questions later, bump SURVEY_VERSION and keep old option ids
// stable where the meaning is unchanged, so older answers still chart.

export const SURVEY_VERSION = 1;

export type QuestionKind = "multi" | "single" | "scale" | "text";

export type SurveyQuestion = {
  id: string;
  kind: QuestionKind;
  // {exhibition} is replaced with the show name when shown to the pilot.
  title: string;
  // Short label for admin charts and CSV headers.
  label: string;
  hint: string;
  required: boolean;
  options?: { id: string; label: string }[];
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "capture",
    kind: "multi",
    title: "How did you capture leads at {exhibition}?",
    label: "How they capture leads",
    hint: "Tick all that apply",
    required: true,
    options: [
      { id: "cards", label: "Business cards" },
      { id: "notebook", label: "Notebook or paper" },
      { id: "phone", label: "Phone notes or photos" },
      { id: "excel", label: "Excel or a spreadsheet" },
      { id: "crm", label: "A CRM or another app" },
      { id: "memory", label: "From memory" },
    ],
  },
  {
    id: "count",
    kind: "single",
    title: "Roughly how many contacts or business cards did you collect?",
    label: "Contacts collected",
    hint: "Pick one",
    required: true,
    options: [
      { id: "lt25", label: "Under 25" },
      { id: "25_50", label: "25 to 50" },
      { id: "50_100", label: "50 to 100" },
      { id: "100_200", label: "100 to 200" },
      { id: "gt200", label: "More than 200" },
    ],
  },
  {
    id: "where",
    kind: "multi",
    title: "Where are those leads now?",
    label: "Where the leads are now",
    hint: "Tick all that apply",
    required: true,
    options: [
      { id: "cards", label: "Still a stack of cards" },
      { id: "excel", label: "In Excel" },
      { id: "crm", label: "In our CRM or ERP" },
      { id: "email", label: "In email or WhatsApp" },
      { id: "colleague", label: "With a colleague" },
      { id: "none", label: "Not organised yet" },
    ],
  },
  {
    id: "ease",
    kind: "scale",
    title: "How easy is it to remember what each buyer discussed with you?",
    label: "Remembering what each buyer said",
    hint: "1 is very hard, 5 is very easy",
    required: true,
  },
  {
    id: "blocker",
    kind: "multi",
    title: "What kept you from using ExpoLead OS at the show?",
    label: "What kept them from using ExpoLead OS",
    hint: "Tick all that apply",
    required: true,
    options: [
      { id: "busy", label: "Too busy at the booth" },
      { id: "unsure", label: "Not sure how to start" },
      { id: "paper", label: "Paper is faster at the booth" },
      { id: "tech", label: "Phone or internet issues" },
      { id: "used", label: "I did use it" },
      { id: "other", label: "Something else" },
    ],
  },
  {
    id: "value",
    kind: "single",
    title: "What is a typical first order from a new show buyer worth?",
    label: "Typical first order",
    hint: "In US dollars. Optional, and it helps us show the value of every lead",
    required: false,
    options: [
      { id: "lt5k", label: "Under $5,000" },
      { id: "5k_20k", label: "$5,000 to $20,000" },
      { id: "20k_50k", label: "$20,000 to $50,000" },
      { id: "gt50k", label: "Over $50,000" },
      { id: "skip", label: "Prefer not to say" },
    ],
  },
  {
    id: "call",
    kind: "single",
    title: "Would a 15 minute call to set up your {exhibition} leads help?",
    label: "Wants a call",
    hint: "Pick one",
    required: true,
    options: [
      { id: "yes", label: "Yes, please contact me" },
      { id: "no", label: "Not right now" },
    ],
  },
  {
    id: "headache",
    kind: "text",
    title: "What is your biggest headache after a show?",
    label: "Biggest headache after a show",
    hint: "Optional. One line is plenty",
    required: false,
  },
];

export const TEXT_MAX = 1000;

export type SurveyAnswers = Record<string, string | string[] | number>;

/**
 * Validates and normalises raw answers against the survey definition. Unknown
 * questions and options are dropped, so the stored JSON only ever contains
 * known ids. Returns null when a required question is missing.
 */
export function cleanAnswers(raw: unknown): SurveyAnswers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const out: SurveyAnswers = {};

  for (const q of SURVEY_QUESTIONS) {
    const v = input[q.id];
    const optionIds = new Set((q.options ?? []).map((o) => o.id));

    if (q.kind === "multi") {
      const picked = Array.isArray(v)
        ? Array.from(new Set(v.filter((x): x is string => typeof x === "string" && optionIds.has(x))))
        : [];
      if (picked.length) out[q.id] = picked;
    } else if (q.kind === "single") {
      if (typeof v === "string" && optionIds.has(v)) out[q.id] = v;
    } else if (q.kind === "scale") {
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isInteger(n) && n >= 1 && n <= 5) out[q.id] = n;
    } else if (q.kind === "text") {
      if (typeof v === "string") {
        const t = v.replace(/\s+/g, " ").trim().slice(0, TEXT_MAX);
        if (t) out[q.id] = t;
      }
    }

    if (q.required && out[q.id] === undefined) return null;
  }
  return out;
}

export function fillTitle(title: string, exhibition: string) {
  return title.split("{exhibition}").join(exhibition);
}
