// Seeds one admin, one teacher, one student via the Supabase Admin API —
// the same path the dashboard's "Add user" button uses — rather than
// hand-inserting rows into auth.users/auth.identities. A raw-SQL seed is
// fragile against the exact shape of Supabase's internal auth schema,
// which differs across project/Postgres versions; the Admin API is not.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: "admin@lms.local", full_name: "Admin Utama", role: "admin" },
  { email: "teacher@lms.local", full_name: "Guru Contoh", role: "teacher" },
  { email: "student@lms.local", full_name: "Siswa Contoh", role: "student" },
];

const PASSWORD = "password123";

for (const { email, full_name, role } of users) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error(`Failed to create ${email}:`, error.message);
    continue;
  }

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: data.user.id, role, full_name });

  if (profileError) {
    console.error(`Created ${email} but failed to insert profile:`, profileError.message);
    continue;
  }

  console.log(`Seeded ${email} (${role})`);
}
