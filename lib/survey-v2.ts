// Post-show survey, version 2. Single source of truth for the public survey
// (/survey/<campaign>) and the pilot check-in survey (/checkin/<token>): the
// UI renders from it, the submit routes validate against it and the admin
// Feedback page labels and charts from it, so they can never drift apart.
//
// Every question is required (Gladwin's decision: no "prefer not to say").
// Which questions someone sees depends on the mode (public or pilot) and the
// path (exhibitor or visitor, chosen in the first public question; pilots are
// always exhibitors).

export const SURVEY_V2 = 2;

export type SurveyMode = "public" | "pilot";
export type SurveyPath = "ex" | "vi";
export type QKind = "multi" | "single" | "scale" | "text" | "line";

export type Option = { id: string; label: string };

export type Question = {
  id: string;
  kind: QKind;
  // {exhibition} is replaced with the show name.
  title: string;
  // Short label for admin charts and CSV headers.
  label: string;
  hint: string;
  options?: Option[];
  max?: number;
  scale?: [string, string];
  placeholder?: string;
};

export type Section = {
  key: string;
  title: string;
  sub?: string;
  paths?: SurveyPath[];
  modes?: SurveyMode[];
  questions: Question[];
};

const pick = "Pick one";
const tick = "Tick all that apply";

export const SECTIONS: Section[] = [
  {
    key: "intro",
    title: "",
    modes: ["public"],
    questions: [
      {
        id: "role_show", kind: "single", title: "At {exhibition} you were", label: "At the show they were", hint: pick,
        options: [
          { id: "exhibit", label: "Exhibiting" },
          { id: "visit", label: "Visiting (buying or sourcing)" },
          { id: "both", label: "Both" },
        ],
      },
    ],
  },
  {
    key: "about",
    title: "About you",
    sub: "So we can compare like with like.",
    questions: [
      {
        id: "job", kind: "single", title: "Your role", label: "Role", hint: pick,
        options: [
          { id: "owner", label: "Owner or director" },
          { id: "sales", label: "Sales or export" },
          { id: "marketing", label: "Marketing" },
          { id: "sourcing", label: "Sourcing or purchasing" },
          { id: "other", label: "Other" },
        ],
      },
      {
        id: "size", kind: "single", title: "Company size", label: "Company size", hint: pick,
        options: [
          { id: "s1", label: "1 to 10" },
          { id: "s2", label: "11 to 50" },
          { id: "s3", label: "51 to 200" },
          { id: "s4", label: "Over 200" },
        ],
      },
      {
        id: "shows", kind: "single", title: "How many trade shows does your company do a year?", label: "Shows a year", hint: pick,
        options: [
          { id: "1", label: "1" },
          { id: "2_3", label: "2 to 3" },
          { id: "4_6", label: "4 to 6" },
          { id: "7p", label: "7 or more" },
        ],
      },
    ],
  },
  {
    key: "at_show",
    title: "At the show",
    sub: "How contacts were captured at the booth.",
    paths: ["ex"],
    questions: [
      {
        id: "count", kind: "single", title: "Roughly how many contacts did you make at {exhibition}?", label: "Contacts made", hint: pick,
        options: [
          { id: "lt25", label: "Under 25" },
          { id: "25_50", label: "25 to 50" },
          { id: "50_100", label: "50 to 100" },
          { id: "100_200", label: "100 to 200" },
          { id: "gt200", label: "More than 200" },
        ],
      },
      {
        id: "capture", kind: "multi", title: "How did you capture them?", label: "How they captured contacts", hint: tick,
        options: [
          { id: "cards", label: "Business cards" },
          { id: "notebook", label: "Notebook or paper" },
          { id: "phone", label: "Phone notes or photos" },
          { id: "excel", label: "Excel or a spreadsheet" },
          { id: "memory", label: "From memory" },
        ],
      },
      {
        id: "notes", kind: "single", title: "How much of each conversation did you write down?", label: "Notes taken", hint: pick,
        options: [
          { id: "all", label: "Almost everything" },
          { id: "key", label: "Key points only" },
          { id: "little", label: "Very little" },
          { id: "none", label: "Nothing, I rely on memory" },
        ],
      },
    ],
  },
  {
    key: "after_show",
    title: "After the show",
    sub: "Where contacts usually slip through the cracks.",
    paths: ["ex"],
    questions: [
      {
        id: "where", kind: "multi", title: "Where are those contacts now?", label: "Where the contacts are now", hint: tick,
        options: [
          { id: "cards", label: "Still a stack of cards" },
          { id: "excel", label: "In Excel" },
          { id: "email", label: "In email or WhatsApp" },
          { id: "colleague", label: "With colleagues" },
          { id: "none", label: "Not organised yet" },
        ],
      },
      {
        id: "holders", kind: "single", title: "How many people in your company hold contacts from this show?", label: "People holding contacts", hint: pick,
        options: [
          { id: "1", label: "Just me" },
          { id: "2_3", label: "2 to 3 people" },
          { id: "4p", label: "4 or more" },
        ],
      },
      {
        id: "speed", kind: "single", title: "When does the first follow-up usually go out?", label: "First follow-up", hint: pick,
        options: [
          { id: "2d", label: "Within 2 days" },
          { id: "1w", label: "Within a week" },
          { id: "4w", label: "Within 2 to 4 weeks" },
          { id: "later", label: "Later than that" },
        ],
      },
      {
        id: "lost", kind: "single", title: "From a typical show, how many contacts never get a proper follow-up?", label: "Never followed up", hint: "Your honest guess is fine",
        options: [
          { id: "few", label: "Almost none" },
          { id: "q", label: "About a quarter" },
          { id: "h", label: "About half" },
          { id: "m", label: "More than half" },
          { id: "dk", label: "I honestly don't know" },
        ],
      },
      {
        id: "happened", kind: "multi", title: "Has any of this happened to you after a show?", label: "Happened after a show", hint: tick,
        options: [
          { id: "forgot_ask", label: "Forgot what a buyer asked for" },
          { id: "face", label: "Couldn't match a card to a conversation" },
          { id: "double", label: "A colleague and I contacted the same buyer" },
          { id: "lostnotes", label: "Lost cards or notes" },
          { id: "promise", label: "Forgot a promised sample or quote" },
          { id: "nothing", label: "None of these" },
        ],
      },
    ],
  },
  {
    key: "worth",
    title: "What it is worth",
    sub: "Ranges only. Used for your report, never shared with your name.",
    paths: ["ex"],
    questions: [
      {
        id: "cost", kind: "single", title: "What did {exhibition} cost your company in total?", label: "Show cost", hint: "Stand, travel, samples and staff. Your best estimate is fine",
        options: [
          { id: "c1", label: "Under $10,000" },
          { id: "c2", label: "$10,000 to $25,000" },
          { id: "c3", label: "$25,000 to $50,000" },
          { id: "c4", label: "$50,000 to $100,000" },
          { id: "c5", label: "Over $100,000" },
        ],
      },
      {
        id: "order", kind: "single", title: "What is a typical first order from a new show buyer worth?", label: "Typical first order", hint: "Your best estimate is fine",
        options: [
          { id: "o1", label: "Under $5,000" },
          { id: "o2", label: "$5,000 to $20,000" },
          { id: "o3", label: "$20,000 to $50,000" },
          { id: "o4", label: "Over $50,000" },
        ],
      },
      {
        id: "roi", kind: "single", title: "Can you tell how much business a show brought in?", label: "Knows show results", hint: pick,
        options: [
          { id: "yes", label: "Yes, exactly" },
          { id: "rough", label: "Roughly" },
          { id: "no", label: "Not really" },
        ],
      },
    ],
  },
  {
    key: "visitor",
    title: "As a visitor",
    sub: "The other side of the booth.",
    paths: ["vi"],
    questions: [
      {
        id: "v_talks", kind: "single", title: "How many exhibitors did you have serious talks with?", label: "Serious talks (visitors)", hint: pick,
        options: [
          { id: "lt5", label: "Under 5" },
          { id: "5_15", label: "5 to 15" },
          { id: "15_30", label: "15 to 30" },
          { id: "gt30", label: "More than 30" },
        ],
      },
      {
        id: "v_track", kind: "multi", title: "How do you keep track of the suppliers you met?", label: "How visitors track suppliers", hint: tick,
        options: [
          { id: "cards", label: "Their business cards" },
          { id: "brochures", label: "Brochures and catalogues" },
          { id: "phone", label: "Phone notes or photos" },
          { id: "excel", label: "A spreadsheet" },
          { id: "memory", label: "From memory" },
        ],
      },
      {
        id: "v_followed", kind: "single", title: "So far, how many of the exhibitors you met have followed up with you?", label: "Exhibitors who followed up", hint: pick,
        options: [
          { id: "most", label: "Most of them" },
          { id: "half", label: "About half" },
          { id: "few", label: "Only a few" },
          { id: "none", label: "None yet" },
        ],
      },
    ],
  },
  {
    key: "one_place",
    title: "One place for every show",
    sub: "Imagine opening one workspace each morning with every {short} contact, what you discussed and who to follow up today.",
    questions: [
      {
        id: "useful", kind: "scale", title: "How useful would a workspace like that be for you?", label: "Usefulness of one workspace", hint: "1 is not useful, 5 is essential",
        scale: ["Not useful", "Essential"],
      },
      {
        id: "matters", kind: "multi", max: 2, title: "What would matter most to you?", label: "What matters most", hint: "Pick up to 2",
        options: [
          { id: "never_forget", label: "Never missing a follow-up" },
          { id: "remember", label: "Remembering what each buyer said" },
          { id: "roi", label: "Seeing what each show earned" },
          { id: "team", label: "Sharing contacts with my team" },
          { id: "fast", label: "Capturing faster at the booth" },
        ],
      },
      {
        id: "cost_deal", kind: "multi", title: "Has a slow or forgotten follow-up ever cost a deal?", label: "Slow follow-up cost a deal", hint: "Think of either side of the booth. Tick all that apply",
        options: [
          { id: "buyer_left", label: "Yes, a buyer chose another supplier over us" },
          { id: "i_left", label: "Yes, I chose another supplier because one was slow" },
          { id: "no", label: "No" },
          { id: "unsure", label: "Not sure" },
        ],
      },
      {
        id: "headache", kind: "text", title: "What is your biggest headache after a show?", label: "Biggest headache after a show", hint: "One line is plenty",
        placeholder: "For example: knowing who to follow up first",
      },
    ],
  },
  {
    key: "pilot_last",
    title: "Last three questions",
    sub: "Then your post-show report.",
    modes: ["pilot"],
    questions: [
      {
        id: "blocker", kind: "multi", title: "What kept you from using ExpoLead OS at {exhibition}?", label: "What kept them from using ExpoLead OS", hint: tick,
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
        id: "call", kind: "single", title: "Would a 15 minute call to set up your {exhibition} contacts help?", label: "Wants a call", hint: pick,
        options: [
          { id: "yes", label: "Yes, please contact me" },
          { id: "no", label: "Not right now" },
        ],
      },
      {
        id: "next_show", kind: "line", title: "Your next trade show", label: "Next trade show", hint: "Pick from the list or type your own",
        placeholder: "Start typing, e.g. SIAL Paris 2028",
      },
    ],
  },
  {
    key: "public_last",
    title: "Stay in touch",
    sub: "So we can send your report and the combined results.",
    modes: ["public"],
    questions: [
      {
        id: "try", kind: "single", title: "Would you like to try ExpoLead OS free at your next show?", label: "Wants to try ExpoLead OS", hint: pick,
        options: [
          { id: "yes", label: "Yes, I'm interested" },
          { id: "no", label: "Not right now" },
        ],
      },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions);

export function sectionsFor(mode: SurveyMode, path: SurveyPath): Section[] {
  return SECTIONS.filter((s) => (!s.modes || s.modes.includes(mode)) && (!s.paths || s.paths.includes(path)));
}

export function pathFor(mode: SurveyMode, roleShow: unknown): SurveyPath {
  return mode === "pilot" ? "ex" : roleShow === "visit" ? "vi" : "ex";
}

export function fill(text: string, exhibition: string) {
  const short = exhibition.split(" ")[0] || exhibition;
  return text.split("{exhibition}").join(exhibition).split("{short}").join(short);
}

export const TEXT_MAX = 1000;
export type Answers = Record<string, string | string[] | number>;

/** True when one question has a usable answer. */
export function hasAnswer(q: Question, v: unknown): boolean {
  if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
  if (q.kind === "scale") return typeof v === "number" && v >= 1 && v <= 5;
  if (q.kind === "text" || q.kind === "line") return typeof v === "string" && v.trim() !== "";
  return typeof v === "string" && !!q.options?.some((o) => o.id === v);
}

/**
 * Validates raw answers for a mode. Keeps only known questions and options for
 * the sections this person saw, and returns null if any of them is missing.
 */
export function cleanAnswersV2(raw: unknown, mode: SurveyMode): Answers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const path = pathFor(mode, input.role_show);
  const out: Answers = {};
  for (const sec of sectionsFor(mode, path)) {
    for (const q of sec.questions) {
      const v = input[q.id];
      const ids = new Set((q.options ?? []).map((o) => o.id));
      if (q.kind === "multi") {
        let list = Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === "string" && ids.has(x)))) : [];
        if (q.max) list = list.slice(0, q.max);
        if (list.length) out[q.id] = list;
      } else if (q.kind === "single") {
        if (typeof v === "string" && ids.has(v)) out[q.id] = v;
      } else if (q.kind === "scale") {
        const n = typeof v === "number" ? v : Number(v);
        if (Number.isInteger(n) && n >= 1 && n <= 5) out[q.id] = n;
      } else {
        if (typeof v === "string") {
          const t = v.replace(/\s+/g, " ").trim().slice(0, q.kind === "line" ? 120 : TEXT_MAX);
          if (t) out[q.id] = t;
        }
      }
      if (out[q.id] === undefined) return null;
    }
  }
  return out;
}

// Public campaigns. A campaign is one show; its slug is the survey URL.
export type Campaign = { slug: string; exhibition: string; label: string; open: boolean };
export const CAMPAIGNS: Record<string, Campaign> = {
  "sial-paris-2026": { slug: "sial-paris-2026", exhibition: "SIAL Paris", label: "SIAL Paris 2026", open: true },
};

// Business email only: common free mailbox domains are refused.
const FREE_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.fr", "ymail.com", "hotmail.com", "hotmail.co.uk", "hotmail.fr",
  "outlook.com", "outlook.fr", "live.com", "live.fr", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me",
  "protonmail.com", "gmx.com", "gmx.de", "gmx.net", "mail.com", "yandex.com", "yandex.ru", "zoho.com", "qq.com", "163.com",
  "126.com", "sina.com", "rediffmail.com", "web.de", "orange.fr", "free.fr", "laposte.net",
]);

export function emailProblem(v: string): string {
  const e = v.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e) || e.length > 254) return "Please enter a valid email address.";
  if (FREE_DOMAINS.has(e.split("@")[1])) return "Please use your business email. Personal addresses like Gmail, Yahoo or Outlook are not accepted.";
  return "";
}

// Suggestions for "your next trade show" (anyone can type their own).
export const NEXT_SHOW_SUGGESTIONS = [
  "SIAL Paris 2028", "Gulfood 2027", "FOODEX JAPAN 2027", "International Food & Drink Event (IFE) 2027", "In-cosmetics Global 2027",
  "Seoul Food & Hotel 2027", "Asia Fruit Logistica 2027", "Fine Food Australia 2027", "Anuga 2027", "Not decided yet",
];

export function optionLabel(qid: string, v: unknown): string {
  const q = ALL_QUESTIONS.find((x) => x.id === qid);
  if (!q || v === undefined || v === null) return "";
  if (q.kind === "scale") return `${v} of 5`;
  if (q.kind === "text" || q.kind === "line") return String(v);
  const lab = (id: string) => q.options?.find((o) => o.id === id)?.label ?? id;
  return Array.isArray(v) ? v.map(lab).join(", ") : lab(String(v));
}
