import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ImportConnections, { type ImportHistoryItem } from "@/components/ImportConnections";
import { getExhibitions } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";
import { createClient } from "@/lib/supabase/server";

const TRIAL_CONNECTION_CAP = 25;

export default async function ImportConnectionsPage() {
  const [exhibitions, trial] = await Promise.all([getExhibitions(), getTrialStatus()]);
  if (trial.isExpired) redirect("/connections?locked=1");

  // How many more connections a trial account may add (null = no limit). The
  // database enforces the cap; this only lets the preview say so up front.
  const supabase = await createClient();
  const { data: unlimitedRpc, error: rpcErr } = await supabase.rpc("has_unlimited_plan");
  const unlimited = rpcErr ? trial.canExport : unlimitedRpc === true;
  let remaining: number | null = null;
  if (!unlimited) {
    const { count } = await supabase.from("suppliers").select("id", { count: "exact", head: true });
    remaining = Math.max(0, TRIAL_CONNECTION_CAP - (count ?? 0));
  }

  // Past imports (migration 0056). Missing table = no history section.
  let history: ImportHistoryItem[] = [];
  const { data: imports, error: histErr } = await supabase
    .from("connection_imports")
    .select("id, file_name, row_count, undone_at, created_at, exhibition:exhibitions(name)")
    .order("created_at", { ascending: true });
  if (!histErr && imports && imports.length) {
    const { data: linked } = await supabase.from("suppliers").select("import_id").not("import_id", "is", null);
    const live = new Map<string, number>();
    for (const s of linked ?? []) {
      const k = s.import_id as string;
      live.set(k, (live.get(k) ?? 0) + 1);
    }
    history = imports
      .map((imp, i) => {
        const ex = imp.exhibition as { name?: string } | { name?: string }[] | null;
        const exName = Array.isArray(ex) ? ex[0]?.name : ex?.name;
        return {
          id: imp.id as string,
          number: i + 1,
          fileName: imp.file_name as string,
          exhibition: exName ?? null,
          imported: imp.row_count as number,
          stillThere: live.get(imp.id as string) ?? 0,
          undone: !!imp.undone_at,
          createdAt: imp.created_at as string,
        };
      })
      .reverse();
  }

  return (
    <>
      <PageHeader title="Import connections" subtitle="Add many connections at once from the ExpoLead template" />
      <main className="flex-1 p-6 md:p-8">
        <ImportConnections
          exhibitions={exhibitions.map((e) => ({ id: e.id, name: e.name }))}
          remaining={remaining}
          history={history}
        />
      </main>
    </>
  );
}
