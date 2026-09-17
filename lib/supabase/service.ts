import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for trusted server-to-server contexts that have
 * NO user session, such as the payment webhook. It bypasses RLS, so use it ONLY
 * in server code that has already authenticated the caller by other means (a
 * verified webhook signature, CRON_SECRET, etc.). NEVER import this into client
 * code or expose the service-role key to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
