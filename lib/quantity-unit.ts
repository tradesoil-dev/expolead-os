import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_QUANTITY_UNIT } from "@/lib/quantity-units";

export { QUANTITY_UNITS, DEFAULT_QUANTITY_UNIT } from "@/lib/quantity-units";

// Reads the signed-in user's chosen quantity unit. Falls back to MT so nothing
// breaks if the column is missing or the user has never set it. Server only.
export async function getQuantityUnit(): Promise<string> {
  if (!isSupabaseConfigured) return DEFAULT_QUANTITY_UNIT;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_QUANTITY_UNIT;
  const { data } = await supabase
    .from("profiles")
    .select("quantity_unit")
    .eq("id", user.id)
    .single();
  return data?.quantity_unit || DEFAULT_QUANTITY_UNIT;
}
