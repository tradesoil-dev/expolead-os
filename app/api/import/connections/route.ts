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
//
// Import history (migration 0056): each import gets a connection_imports row
// and its connections carry import_id, so the user can see past imports and
// undo one (DELETE below). If the migration is not applied yet the import
// still works, just without history.

export const dynamic = "force-dynamic";

const CHUNK = 250;
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const PART_WAY = "The import stopped part way. The connections listed as imported were saved.";

function supplierRow(r: ImportRow, id: string, exhibitionId: string | null, importId: string | null) {
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
    ...(importId ? { import_id: importId } : {}),
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

  let body: { exhibitionId?: unknown; rows?: unknown; fileName?: unknown };
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

  // History log. Best effort: no table yet (0056 not applied) = no history.
  const fileName =
    (typeof body.fileName === "string" ? body.fileName.replace(/\s+/g, " ").trim().slice(0, 200) : "") || "Imported file";
  const { data: log } = await supabase
    .from("connection_imports")
    .insert({ file_name: fileName, exhibition_id: exhibitionId, row_count: 0 })
    .select("id")
    .single();
  const importId = (log?.id as string | undefined) ?? null;

  let imported = 0;
  const finish = async (payload: Record<string, unknown>, status = 200) => {
    if (importId) {
      if (imported > 0) await supabase.from("connection_imports").update({ row_count: imported }).eq("id", importId);
      else await supabase.from("connection_imports").delete().eq("id", importId);
    }
    return NextResponse.json({ imported, total: rows.length, ...payload }, { status });
  };

  if (unlimited) {
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const ids = chunk.map(() => randomUUID());
      const { error: supErr } = await supabase
        .from("suppliers")
        .insert(chunk.map((r, k) => supplierRow(r, ids[k], exhibitionId, importId)));
      if (supErr) return finish({ error: PART_WAY }, 500);
      const contacts = chunk.map((r, k) => contactRow(r, ids[k])).filter((c) => c !== null);
      if (contacts.length) {
        const { error: conErr } = await supabase.from("contacts").insert(contacts);
        if (conErr) {
          // Fail safe: never leave companies without the contacts they came with.
          await supabase.from("suppliers").delete().in("id", ids);
          return finish({ error: PART_WAY }, 500);
        }
      }
      imported += chunk.length;
    }
    return finish({ limitReached: false });
  }

  // Trial: one row per statement so the 25 connection cap is enforced exactly.
  for (const r of rows) {
    const id = randomUUID();
    const { error: supErr } = await supabase.from("suppliers").insert(supplierRow(r, id, exhibitionId, importId));
    if (supErr) {
      const isCap = supErr.code === "42501" || /row-level security/i.test(supErr.message ?? "");
      return isCap ? finish({ limitReached: true }) : finish({ error: PART_WAY }, 500);
    }
    const c = contactRow(r, id);
    if (c) {
      const { error: conErr } = await supabase.from("contacts").insert(c);
      if (conErr) {
        await supabase.from("suppliers").delete().eq("id", id);
        return finish({ error: PART_WAY }, 500);
      }
    }
    imported++;
  }
  return finish({ limitReached: false });
}

// Undo one import: delete every connection it created (their contacts,
// meetings and products go with them, as when a connection is deleted by
// hand) and mark the import as undone. RLS limits both to the user's own rows.
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Import not found." }, { status: 400 });

  const { data: imp } = await supabase.from("connection_imports").select("id, undone_at").eq("id", id).maybeSingle();
  if (!imp) return NextResponse.json({ error: "Import not found." }, { status: 404 });
  if (imp.undone_at) return NextResponse.json({ removed: 0 });

  const { data: gone, error } = await supabase.from("suppliers").delete().eq("import_id", id).select("id");
  if (error) return NextResponse.json({ error: "Could not undo this import. Please try again." }, { status: 500 });

  await supabase.from("connection_imports").update({ undone_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ removed: gone?.length ?? 0 });
}
