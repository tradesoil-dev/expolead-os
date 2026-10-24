// Builds the post-show report from one person's answers. Pure functions, used
// by the on-screen report and the emailed copy. Every number comes only from
// that person's own answers; answers are ranges, so results are ranges too.

import { optionLabel, type Answers } from "@/lib/survey-v2";

export type Level = "red" | "amber" | "green";
export type Habit = { name: string; long: string; score: 1 | 2 | 3 };

export type ExhibitorReport = {
  kind: "exhibitor";
  level: Level;
  badge: string;
  head: string;
  body: string;
  perContact: { value: string; sub: string } | null;
  atRisk: { value: string; sub: string } | null;
  habits: Habit[];
  weak: string[];
  funnel: { made: string; share: number | null; followedLabel: string; lostLabel: string } | null;
  speed: { key: string; label: string } | null;
  spend: { value: string; share: number; pct: string; sub: string } | null;
  plan: [string, string][];
  nextTip: string;
};

export type VisitorReport = {
  kind: "visitor";
  level: Level;
  badge: string;
  head: string;
  body: string;
  talks: string; // e.g. "5 to 15"
  tracked: string; // e.g. "Their business cards, From memory"
  // Both sides of the follow-up, as the person answered them. pct is only the
  // bar length for a word answer ("Most of them" shows as a long bar).
  theirs: { key: string; label: string; pct: number };
  yours: { key: string; label: string; pct: number };
  plan: [string, string][];
  nextTip: string;
};

// Bar length for a word answer about follow-ups. Visual only; the label shows the answer.
export const FOLLOW_PCT: Record<string, number> = { most: 75, half: 50, few: 20, none: 3 };
export type SurveyReportData = ExhibitorReport | VisitorReport;

const CONTACTS: Record<string, [number | null, number | null]> = {
  lt25: [null, 25], "25_50": [25, 50], "50_100": [50, 100], "100_200": [100, 200], gt200: [200, null],
};
const COST: Record<string, [number | null, number | null]> = {
  c1: [null, 10000], c2: [10000, 25000], c3: [25000, 50000], c4: [50000, 100000], c5: [100000, null],
};
// Share of contacts the person says never get a proper follow-up.
const LOST: Record<string, [number, number | null]> = { q: [0.25, 0.25], h: [0.5, 0.5], m: [0.5, null] };

// Honest rounding: a lower bound never rounds down and an upper bound never
// rounds up, so a range never claims more than the answers support
// (e.g. $25,000 / 200 = $125 shows "up to $125", never "$130").
type Fmt = { step: (n: number) => number; show: (n: number) => string };
const MONEY: Fmt = { step: (n) => (n < 1000 ? 5 : 50), show: (n) => "$" + n.toLocaleString("en-US") };
const WHOLE: Fmt = { step: () => 1, show: (n) => String(n) };
const up = (n: number, f: Fmt) => Math.ceil(n / f.step(n)) * f.step(n);
const down = (n: number, f: Fmt) => Math.floor(n / f.step(n)) * f.step(n);
const near = (n: number, f: Fmt) => Math.round(n / f.step(n)) * f.step(n);

function rangeText(lo: number | null, hi: number | null, f: Fmt) {
  if (lo != null && hi != null) {
    const l = up(lo, f), h = down(hi, f);
    return l >= h ? `about ${f.show(near((lo + hi) / 2, f))}` : `${f.show(l)} to ${f.show(h)}`;
  }
  if (lo != null) return `at least ${f.show(up(lo, f))}`;
  if (hi != null) return `up to ${f.show(down(hi, f))}`;
  return "";
}

const has = (a: Answers, k: string, v: string) => Array.isArray(a[k]) && (a[k] as string[]).includes(v);
const str = (a: Answers, k: string) => (typeof a[k] === "string" ? (a[k] as string) : "");

export function buildReport(a: Answers, exhibition: string): SurveyReportData {
  const short = exhibition.split(" ")[0] || exhibition;
  if (a.role_show === "visit") return visitorReport(a, exhibition);

  // Status points from the answers.
  let pts = 0;
  const stack = has(a, "where", "cards") || has(a, "where", "none");
  if (stack) pts += 2;
  if (a.notes === "little" || a.notes === "none") pts += 2;
  else if (a.notes === "key") pts += 1;
  if (a.holders === "4p") pts += 2;
  else if (a.holders === "2_3") pts += 1;
  if (a.speed === "later") pts += 2;
  else if (a.speed === "4w") pts += 1;
  // Losing half or more of a show's contacts is never "good shape".
  if (a.lost === "m") pts += 4;
  else if (a.lost === "h") pts += 3;
  else if (a.lost === "q" || a.lost === "dk") pts += 1;
  if (a.roi === "no") pts += 1;
  const level: Level = pts >= 6 ? "red" : pts >= 3 ? "amber" : "green";

  const c = CONTACTS[str(a, "count")];
  const cost = COST[str(a, "cost")];
  const lost = LOST[str(a, "lost")];
  const countLabel = optionLabel("count", a.count).toLowerCase();

  let perContact: ExhibitorReport["perContact"] = null;
  if (c && cost) {
    const v = rangeText(cost[0] != null && c[1] != null ? cost[0] / c[1] : null, cost[1] != null && c[0] != null ? cost[1] / c[0] : null, MONEY);
    if (v) perContact = { value: v, sub: `${optionLabel("cost", a.cost)} divided by ${countLabel} contacts` };
  }

  let atRisk: ExhibitorReport["atRisk"] = null;
  if (c && lost) {
    const v = rangeText(c[0] != null ? Math.max(1, c[0] * lost[0]) : null, c[1] != null && lost[1] != null ? c[1] * lost[1] : null, WHOLE);
    if (v) atRisk = { value: v, sub: `${optionLabel("lost", a.lost)} of ${countLabel} contacts, your own estimate` };
  } else if (a.lost === "few") atRisk = { value: "Very few", sub: "You follow up almost everyone. Well done" };
  else if (a.lost === "dk") atRisk = { value: "Unknown", sub: "Not knowing is itself the risk" };

  const capture = (a.capture as string[] | undefined) ?? [];
  const habits: Habit[] = [
    { name: "Capture", long: "how you capture", score: !capture.length ? 2 : capture.every((v) => v === "memory") ? 1 : capture.some((v) => ["excel", "phone"].includes(v)) ? 3 : 2 },
    { name: "Notes", long: "taking notes", score: ({ all: 3, key: 2, little: 1, none: 1 } as Record<string, 1 | 2 | 3>)[str(a, "notes")] ?? 2 },
    { name: "Speed", long: "follow-up speed", score: ({ "2d": 3, "1w": 2, "4w": 1, later: 1 } as Record<string, 1 | 2 | 3>)[str(a, "speed")] ?? 2 },
    { name: "Team", long: "sharing with your team", score: ({ "1": 3, "2_3": 2, "4p": 1 } as Record<string, 1 | 2 | 3>)[str(a, "holders")] ?? 2 },
    { name: "Results", long: "knowing what the show earned", score: ({ yes: 3, rough: 2, no: 1 } as Record<string, 1 | 2 | 3>)[str(a, "roi")] ?? 2 },
  ];

  let funnel: ExhibitorReport["funnel"] = null;
  if (c && (lost || a.lost === "few" || a.lost === "dk")) {
    funnel = {
      made: optionLabel("count", a.count),
      share: a.lost === "few" ? 0.05 : a.lost === "dk" ? null : lost![0],
      followedLabel: ({ few: "Almost all", q: "About three quarters", h: "About half", m: "Less than half" } as Record<string, string>)[str(a, "lost")] ?? "",
      lostLabel: optionLabel("lost", a.lost),
    };
  }

  let spend: ExhibitorReport["spend"] = null;
  if (cost && lost) {
    const v = rangeText(cost[0] != null ? cost[0] * lost[0] : null, cost[1] != null && lost[1] != null ? cost[1] * lost[1] : null, MONEY);
    if (v) spend = { value: v, share: lost[0], pct: a.lost === "m" ? "50%+" : `${Math.round(lost[0] * 100)}%`, sub: `Of your ${optionLabel("cost", a.cost).toLowerCase()} ${short} budget, tied to contacts that may never get a proper follow-up.` };
  }

  const shared = a.holders === "2_3" || a.holders === "4p";
  const plan: [string, string][] = [
    ["Today", stack ? `Scan your ${short} cards while names still connect to faces and conversations.` : `Open your ${short} list and mark your 10 most promising buyers.`],
    ["Day 2", stack ? "Send a short, personal follow-up to your 10 most promising buyers first." : "Send a short, personal follow-up to those 10 buyers."],
    ["Day 4", has(a, "happened", "promise") ? "Send every sample and quote you promised, each with a date." : shared ? "Merge your colleagues’ contacts into one list, so no buyer is contacted twice or not at all." : "Follow up the next 20 contacts on your list."],
    ["Day 7", "Check who replied, who needs a second touch, and what each conversation could be worth."],
  ];
  const nextTip = a.notes === "little" || a.notes === "none"
    ? "Add a 20 second voice note right after each conversation, while it is fresh."
    : a.roi === "no" ? "Note the source show on every deal you open, so you can see what each show returned." : "";

  const speedLabels: Record<string, string> = { "2d": "Within 2 days", "1w": "Within a week", "4w": "2 to 4 weeks", later: "Later" };
  return {
    kind: "exhibitor",
    level,
    badge: { red: "At risk", amber: "Needs attention", green: "In good shape" }[level],
    head: { red: `Your ${short} contacts are at risk`, amber: "You are getting there", green: "Your contacts are in good shape" }[level],
    body: {
      red: `From your answers, many of your ${exhibition} contacts could quietly go cold before they turn into business.`,
      amber: "You have a system, but a few gaps could let good contacts slip through the cracks.",
      green: "You capture well and follow up fast. Keep it that way as your next shows come round.",
    }[level],
    perContact,
    atRisk,
    habits,
    weak: habits.filter((h) => h.score === 1).map((h) => h.long),
    funnel,
    speed: speedLabels[str(a, "speed")] ? { key: str(a, "speed"), label: speedLabels[str(a, "speed")] } : null,
    spend,
    plan,
    nextTip,
  };
}

// Visitors (buyers and sourcing teams): their tracking, both sides of the
// follow-up, and a 7-day plan, all from their own answers.
function visitorReport(a: Answers, exhibition: string): VisitorReport {
  const short = exhibition.split(" ")[0] || exhibition;
  const theyQuiet = a.v_followed === "few" || a.v_followed === "none";
  const youQuiet = a.v_did === "few" || a.v_did === "none";
  let level: Level, badge: string, head: string, body: string;
  if (theyQuiet && youQuiet) {
    level = "red"; badge = "Going cold"; head = "Conversations are going cold on both sides";
    body = `Few exhibitors have followed up with you, and you have followed up with few of them yourself. The good conversations you had at ${exhibition} are quietly going cold on both sides.`;
  } else if (theyQuiet) {
    level = "amber"; badge = "Gone quiet"; head = "You are doing your part, most exhibitors are not";
    body = `You have been following up, but most of the exhibitors you met at ${exhibition} have gone quiet. That is exactly the gap we are researching: good conversations at the booth that never turn into business.`;
  } else if (youQuiet) {
    level = "amber"; badge = "Your move"; head = "Exhibitors are following up. Are you?";
    body = `Exhibitors from ${exhibition} are reaching out, but you have followed up with few of them so far. A short reply now keeps the best suppliers warm.`;
  } else {
    level = "green"; badge = "Following up"; head = "Both sides are following up well";
    body = "Good to hear. Fast follow-ups on both sides make choosing a supplier much easier.";
  }
  const track = (a.v_track as string[] | undefined) ?? [];
  const memoryOnly = track.length > 0 && track.every((v) => v === "memory");
  const plan: [string, string][] = [
    ["Today", `List the ${short} suppliers that matter most to you, and what each one offered.`],
    ["Day 2", youQuiet ? "Send each of them a short follow-up with what you need next: specs, quantities or a price." : "Chase anyone on your list you have not heard back from yet."],
    ["Day 4", theyQuiet ? "Give the quiet suppliers one more nudge. A slow reply now often means slow service later." : "Ask your best suppliers for samples or a firm quotation."],
    ["Day 7", "Compare the offers side by side and shortlist the suppliers you want to work with."],
  ];
  const nextTip = memoryOnly || track.includes("brochures")
    ? "At your next show, snap each supplier\u2019s card and add a 20 second voice note on what they offered, while it is fresh."
    : "At your next show, note each supplier\u2019s offer and your next step right after the conversation.";
  return {
    kind: "visitor", level, badge, head, body,
    talks: optionLabel("v_talks", a.v_talks),
    tracked: optionLabel("v_track", a.v_track),
    theirs: { key: str(a, "v_followed"), label: optionLabel("v_followed", a.v_followed), pct: FOLLOW_PCT[str(a, "v_followed")] ?? 0 },
    yours: { key: str(a, "v_did"), label: optionLabel("v_did", a.v_did), pct: FOLLOW_PCT[str(a, "v_did")] ?? 0 },
    plan,
    nextTip,
  };
}
