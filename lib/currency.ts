import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_CURRENCY } from "@/lib/currencies";

export { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";

// Reads the signed-in user's workspace currency. Mirrors getQuantityUnit.
// Falls back to USD so nothing breaks if the column is missing or unset.
// Server only.
export async function getCurrency(): Promise<string> {
  if (!isSupabaseConfigured) return DEFAULT_CURRENCY;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_CURRENCY;
  const { data } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();
  return data?.currency || DEFAULT_CURRENCY;
}
