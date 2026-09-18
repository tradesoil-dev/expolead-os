// Duplicate-connection detection for the capture form. A "connection" is a
// suppliers row (the company) plus its primary contact. As a salesperson types
// at a busy booth we check what they enter against their own existing
// connections and surface a gentle, non-blocking hint so they do not create a
// duplicate. Pure functions so the mobile app can reuse them.

export type ExistingSupplier = {
  id: string;
  company_name: string | null;
  exhibition_id: string | null;
};

export type ExistingContact = {
  supplier_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export type DuplicateReason = "email" | "phone" | "company";

// "duplicate" = probably the same person again (same email/phone, or the same
// company AND the same name), so warn. "same_company" = a company we already
// have but a different person, which is fine, so just inform, never alarm.
export type DuplicateKind = "duplicate" | "same_company";

export type DuplicateMatch = {
  supplierId: string;
  company: string;
  contactName: string | null;
  exhibitionId: string | null;
  reason: DuplicateReason;
  kind: DuplicateKind;
};

export type DuplicateInput = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  whatsapp: string;
};

// email is the most reliable signal, then a phone number, then the company name.
const STRENGTH: Record<DuplicateReason, number> = { email: 3, phone: 2, company: 1 };

// Strip a company name down to its distinctive core so "Jiangsu Oleo Co., Ltd"
// and "Jiangsu Oleo Ltd" match. Lower-cased, punctuation and common legal
// suffixes removed, whitespace collapsed.
export function normalizeCompany(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,/()]/g, " ")
    .replace(/\b(co|ltd|inc|llc|plc|pvt|private|limited|company|corp|corporation|gmbh|sa|srl|bv)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Lower-cased, whitespace-collapsed name, so "Li  Wei" and "li wei" compare
// equal when deciding if an entered contact is the same person or a new one.
function normalizeName(s: string): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Digits only, so "+94 77 123 4567" and "0771234567" can be compared.
function digitsOnly(s: string): string {
  return (s || "").replace(/\D/g, "");
}

// Two phone numbers match if their digit strings are equal, or one is a suffix
// of the other (handles a country code being present on only one). Needs at
// least 7 digits to avoid matching short fragments.
function phoneMatch(a: string, b: string): boolean {
  const x = digitsOnly(a);
  const y = digitsOnly(b);
  if (x.length < 7 || y.length < 7) return false;
  return x === y || x.endsWith(y) || y.endsWith(x);
}

/**
 * Find existing connections that look like the one being entered. Returns at
 * most a few matches, strongest signal first. Never throws; empty inputs yield
 * no matches.
 */
export function findDuplicates(
  input: DuplicateInput,
  suppliers: ExistingSupplier[],
  contacts: ExistingContact[],
  limit = 3,
): DuplicateMatch[] {
  const supById = new Map(suppliers.map((s) => [s.id, s]));
  const best = new Map<string, DuplicateMatch>();

  const consider = (
    supplierId: string,
    reason: DuplicateReason,
    contactName: string | null,
    kind: DuplicateKind,
  ) => {
    const sup = supById.get(supplierId);
    if (!sup) return;
    const existing = best.get(supplierId);
    if (existing && STRENGTH[existing.reason] >= STRENGTH[reason]) return;
    best.set(supplierId, {
      supplierId,
      company: (sup.company_name ?? "").trim(),
      contactName: contactName?.trim() || null,
      exhibitionId: sup.exhibition_id,
      reason,
      kind,
    });
  };

  const email = input.email.trim().toLowerCase();
  const hasPhone = digitsOnly(input.phone).length >= 7 || digitsOnly(input.whatsapp).length >= 7;

  // A matching email or phone means it is very likely the same card again.
  for (const c of contacts) {
    if (email && c.email && c.email.trim().toLowerCase() === email) {
      consider(c.supplier_id, "email", c.full_name, "duplicate");
      continue;
    }
    if (
      hasPhone &&
      (phoneMatch(input.phone, c.phone ?? "") ||
        phoneMatch(input.phone, c.whatsapp ?? "") ||
        phoneMatch(input.whatsapp, c.phone ?? "") ||
        phoneMatch(input.whatsapp, c.whatsapp ?? ""))
    ) {
      consider(c.supplier_id, "phone", c.full_name, "duplicate");
    }
  }

  const company = normalizeCompany(input.company_name);
  const inputName = normalizeName(input.full_name);
  if (company.length >= 2) {
    for (const s of suppliers) {
      if (s.company_name && normalizeCompany(s.company_name) === company) {
        const companyContacts = contacts.filter((c) => c.supplier_id === s.id);
        // Same company AND a name we already hold here = probably the same
        // person again (warn). A new name at a known company is a different
        // person (just inform).
        const nameMatches =
          !!inputName &&
          companyContacts.some((c) => normalizeName(c.full_name ?? "") === inputName);
        const primary = companyContacts[0];
        consider(
          s.id,
          "company",
          primary?.full_name ?? null,
          nameMatches ? "duplicate" : "same_company",
        );
      }
    }
  }

  return Array.from(best.values())
    .sort((a, b) => STRENGTH[b.reason] - STRENGTH[a.reason])
    .slice(0, limit);
}
