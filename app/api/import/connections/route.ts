import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { computeTrialStatus } from "@/lib/trial";
import { allowAiRequest } from "@/lib/rate-limit";
import { revalidateRows, type ImportRow } from "@/lib/import/connections-import";

// Bulk import of connections from the ExpoLead CSV template. Everything runs
// under the signed-in user's own session, so row-level security decides what
// can be written, exactly as when a connection is added by hand. The browser's
// parsed rows are re-validated here; the file itself is never sent or stored.
//
// Trial accounts: the database caps a trial at 25 connections, checked per
// INSERT statement. A single multi-row insert would be checked against the
// count before the statement, so trial rows are inserted one at a time and the
// import stops cleanly at the cap. Unlimited accounts insert in chunks.

export const dynamic = "force-dynamic";

const CHUNK = 250;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

function supplierRow(r: ImportRow, id: string, exhibitionId: string | null) {
  return {
    id,
    company_name: r.company_name,
    interest_type: r.interest_type,
    country: r.country,
    website: r.website,
    hall: r.hall,
    booth_number: r.booth_number,
    stand_location: r.stand_location,
    visited: r.visited,
    visit_date: r.visit_date,
    priority: r.priority,
    follow_up_status: r.follow_up_status,
    follow_up_date: r.follow_up_date,
    is_target: r.is_target,
    notes: r.notes,
    exhibition_id: exhibitionId,
    categories: [],
    trade_models: [],
  };
}

function contactRow(r: ImportRow, supplierId: string) {
  return r.contact ? { supplier_id: supplierId, ...r.contact, is_primary: true } : null;
}

export async function POST(req: NextRequest) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That file is too large to import." }, { status: 413 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at, subscription_status, early_access, early_access_until")
    .eq("id", user.id)
    .single();
  const trial = computeTrialStatus(profile ?? null);
  if (trial.isExpired) {
    return NextResponse.json(
      { error: "Your trial has ended, so new connections cannot be added. Upgrade to keep adding." },
      { status: 403 },
    );
  }

  if (!(await allowAiRequest(supabase, "import_connections"))) {
    return NextResponse.json({ error: "Too many imports in the last hour. Please try again later." }, { status: 429 });
  }

  let body: { exhibitionId?: unknown; rows?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Could not read the import." }, { status: 400 });
  }

  const rows = revalidateRows(body.rows);
  if (!rows) {
    return NextResponse.json({ error: "Some rows could not be checked. Please upload the file again." }, { status: 400 });
  }

  // The exhibition must be one of the user's own (RLS scopes this select).
  let exhibitionId: string | null = null;
  if (typeof body.exhibitionId === "string" && body.exhibitionId) {
    const { data: ex } = await supabase.from("exhibitions").select("id").eq("id", body.exhibitionId).maybeSingle();
    if (!ex) return NextResponse.json({ error: "That exhibition was not found." }, { status: 400 });
    exhibitionId = ex.id as string;
  }

  // Same rule the database uses (paid, early access, live pilot window, admin).
  const { data: unlimitedRpc, error: rpcErr } = await supabase.rpc("has_unlimited_plan");
  const unlimited = rpcErr ? trial.canExport : unlimitedRpc === true;

  let imported = 0;

  if (unlimited) {
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const ids = chunk.map(() => randomUUID());
      const { error: supErr } = await supabase.from("suppliers").insert(chunk.map((r, k) => supplierRow(r, ids[k], exhibitionId)));
      if (supErr) {
        return NextResponse.json({ imported, total: rows.length, error: "The import stopped part way. The connections listed as imported were saved." }, { status: 500 });
      }
      const contacts = chunk.map((r, k) => contactRow(r, ids[k])).filter((c) => c !== null);
      if (contacts.length) {
        const { error: conErr } = await supabase.from("contacts").insert(contacts);
        if (conErr) {
          // Fail safe: never leave companies without the contacts they came with.
          await supabase.from("suppliers").delete().in("id", ids);
          return NextResponse.json({ imported, total: rows.length, error: "The import stopped part way. The connections listed as imported were saved." }, { status: 500 });
        }
      }
      imported += chunk.length;
    }
    return NextResponse.json({ imported, total: rows.length, limitReached: false });
  }

  // Trial: one row per statement so the 25 connection cap is enforced exactly.
  for (const r of rows) {
    const id = randomUUID();
    const { error: supErr } = await supabase.from("suppliers").insert(supplierRow(r, id, exhibitionId));
    if (supErr) {
      const isCap = supErr.code === "42501" || /row-level security/i.test(supErr.message ?? "");
      if (isCap) return NextResponse.json({ imported, total: rows.length, limitReached: true });
      return NextResponse.json({ imported, total: rows.length, error: "The import stopped part way. The connections listed as imported were saved." }, { status: 500 });
    }
    const c = contactRow(r, id);
    if (c) {
      const { error: conErr } = await supabase.from("contacts").insert(c);
      if (conErr) {
        await supabase.from("suppliers").delete().eq("id", id);
        return NextResponse.json({ imported, total: rows.length, error: "The import stopped part way. The connections listed as imported were saved." }, { status: 500 });
      }
    }
    imported++;
  }
  return NextResponse.json({ imported, total: rows.length, limitReached: false });
}
