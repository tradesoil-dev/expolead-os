export type Priority = "high" | "medium" | "low";

// Editable classification of an exhibitor (a company you meet at a show).
export type InterestType =
  | "supplier"
  | "trader"
  | "distributor"
  | "agent"
  | "buyer"
  | "partner"
  | "service_provider";

export type FollowUpStatus =
  | "new"
  | "contacted"
  | "sample_requested"
  | "quotation_requested"
  | "under_discussion"
  | "closed";

export interface Exhibition {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface ExhibitionLibraryItem {
  id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  sector: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  supplier_id: string;
  full_name: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  wechat: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  supplier_id: string;
  exhibition_id: string | null;
  met_on: string;
  notes: string | null;
  voice_note_path: string | null;
  created_at: string;
  exhibition?: Exhibition | null;
}
export type Product = {
  id: string;
  supplier_id: string;
  name: string;
  application: string | null;
  certifications: string[];
  created_at: string;
};
export interface Supplier {
  id: string;
  user_id: string;

  exhibition_id: string | null;

  booth_number: string | null;
  hall: string | null;
  stand_location: string | null;
  visited: boolean;
  visit_date: string | null;

  company_name: string;
  country: string | null;
  website: string | null;
  interest_type: InterestType;
  is_target: boolean;
  priority: Priority;
  follow_up_status: FollowUpStatus;
  follow_up_date: string | null;
  categories: string[];
  notes: string | null;
  created_at: string;

    exhibition?: Exhibition | null;
  contacts?: Contact[];
  meetings?: Meeting[];
  products?: Product[];
}

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

// Shown in the UI as "Classification".
export const INTEREST_TYPES: { value: InterestType; label: string }[] = [
  { value: "supplier", label: "Supplier" },
  { value: "trader", label: "Trader" },
  { value: "distributor", label: "Distributor" },
  { value: "agent", label: "Agent" },
  { value: "buyer", label: "Buyer" },
  { value: "partner", label: "Partner" },
  { value: "service_provider", label: "Service provider" },
];

export const FOLLOW_UP_STATUSES: { value: FollowUpStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "sample_requested", label: "Sample requested" },
  { value: "quotation_requested", label: "Quotation requested" },
  { value: "under_discussion", label: "Under discussion" },
  { value: "closed", label: "Closed" },
];

export const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-ink-100 text-ink-700 ring-ink-400/30",
};

export const STATUS_STYLES: Record<FollowUpStatus, string> = {
  new: "bg-ink-100 text-ink-700 ring-ink-400/30",
  contacted: "bg-sky-50 text-sky-700 ring-sky-600/20",
  sample_requested: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  quotation_requested: "bg-violet-50 text-violet-700 ring-violet-600/20",
  under_discussion: "bg-amber-50 text-amber-700 ring-amber-600/20",
  closed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

export const INTEREST_STYLES: Record<InterestType, string> = {
  supplier: "bg-brand-50 text-brand-700 ring-brand-600/20",
  trader: "bg-amber-50 text-amber-700 ring-amber-600/20",
  distributor: "bg-sky-50 text-sky-700 ring-sky-600/20",
  agent: "bg-teal-50 text-teal-700 ring-teal-600/20",
  buyer: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  partner: "bg-violet-50 text-violet-700 ring-violet-600/20",
  service_provider: "bg-pink-50 text-pink-700 ring-pink-600/20",
};

export function priorityLabel(p: Priority) {
  return PRIORITIES.find((x) => x.value === p)?.label ?? p;
}
export function statusLabel(s: FollowUpStatus) {
  return FOLLOW_UP_STATUSES.find((x) => x.value === s)?.label ?? s;
}
export function interestLabel(i: InterestType) {
  return INTEREST_TYPES.find((x) => x.value === i)?.label ?? i;
}
export type Opportunity = {
  id: string;
  user_id: string;

  name: string;
  product: string;
  quantity: string | null;
  quantity_unit: string | null;
  destination_market: string | null;
exhibition: string | null;
booth: string | null;

  priority: "high" | "medium" | "low";

  status:
    | "researching"
    | "contacted"
    | "evaluating"
    | "negotiating"
    | "won"
    | "lost";

  notes: string | null;

next_follow_up_date: string | null;
next_follow_up_note: string | null;
next_follow_up_completed: boolean | null;
created_at: string;
};
export const OPPORTUNITY_STATUSES: { value: Opportunity["status"]; label: string }[] = [
  { value: "researching", label: "Qualified" },
  { value: "contacted", label: "Pricing" },
  { value: "evaluating", label: "Evaluation" },
  { value: "negotiating", label: "Negotiating" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export function opportunityStatusLabel(s: Opportunity["status"]) {
  return OPPORTUNITY_STATUSES.find((x) => x.value === s)?.label ?? s;
}

export type OpportunityFollowUp = {
  id: string;
  opportunity_id: string;
  note: string;
  created_at: string;

};

export type OpportunityStatusHistory = {
  id: string;
  opportunity_id: string;
  status: Opportunity["status"];
  created_at: string;
};