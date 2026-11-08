import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseUrl } from "./server";

/**
 * Service-role client. Bypasses RLS entirely — only for admin user
 * provisioning (create/reset password). Never import this outside
 * app/admin server actions, and never expose it to the client.
 */
export function createAdminClient() {
  const url = getSupabaseUrl()!;
  return createSupabaseClient<Database>(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
