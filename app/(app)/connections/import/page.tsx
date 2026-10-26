import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ImportConnections from "@/components/ImportConnections";
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

  return (
    <>
      <PageHeader title="Import connections" subtitle="Add many connections at once from the ExpoLead template" />
      <main className="flex-1 p-6 md:p-8">
        <ImportConnections exhibitions={exhibitions.map((e) => ({ id: e.id, name: e.name }))} remaining={remaining} />
      </main>
    </>
  );
}
