import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createTokenClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

type ServerClient = Awaited<ReturnType<typeof createServerClient>>;

/**
 * Resolve the signed-in user for an API route from EITHER the browser session
 * cookie (web app) OR an Authorization: Bearer <access_token> header (mobile
 * app). Returns an authenticated Supabase client whose RPC and table calls run
 * as that user, so row level security and the per-user rate limit behave the
 * same on both platforms.
 *
 * The web path is unchanged: with no Bearer header we fall back to the cookie
 * client exactly as before.
 */
export async function getAuthedClient(
  req: Request,
): Promise<{ supabase: ServerClient; user: { id: string } | null }> {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const supabase = createTokenClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }) as unknown as ServerClient;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    return { supabase, user: user ?? null };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user: user ?? null };
}
