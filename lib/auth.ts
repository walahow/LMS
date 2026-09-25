import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  return { supabase, user, profile };
}

/** Belt-and-suspenders check alongside middleware's route-group guard. */
export async function requireRole(role: UserRole) {
  const ctx = await requireUser();
  if (ctx.profile.role !== role) redirect("/login");
  return ctx;
}
