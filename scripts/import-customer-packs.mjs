import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

function isMissingColumnError(error) {
  if (!error) return false;
  const msg = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    msg.includes("does not exist") ||
    msg.includes("could not find")
  );
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const packsPath = path.resolve(process.cwd(), "lib/customer-packs.json");
  const packs = JSON.parse(fs.readFileSync(packsPath, "utf8"));

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Resolve creator user (prefer teacher role, fallback admin)
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["teacher", "admin"]);

  if (profErr) {
    console.error("Failed to query profiles:", profErr.message);
    process.exit(1);
  }

  const creator =
    profiles?.find((p) => p.role === "teacher") ??
    profiles?.find((p) => p.role === "admin") ??
    profiles?.[0];

  if (!creator) {
    console.error("No teacher/admin profile found in Supabase. Run scripts/seed.mjs first.");
    process.exit(1);
  }

  let metadataColumnsMissing = false;

  for (const pack of packs) {
    const { data: existing, error: lookupErr } = await supabase
      .from("question_sets")
      .select("id, title, published")
      .eq("title", pack.title)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (lookupErr) {
      console.error(`Failed looking up "${pack.title}":`, lookupErr.message);
      process.exit(1);
    }

    let setId;
    if (existing) {
      setId = existing.id;
      const { error: updErr } = await supabase
        .from("question_sets")
        .update({
          subject: pack.subject,
          grade: pack.grade,
          indicator: pack.indicator,
        })
        .eq("id", setId);

      if (updErr) {
        console.error(`Failed updating set "${pack.title}":`, updErr.message);
        process.exit(1);
      }

      const { error: delErr } = await supabase.from("questions").delete().eq("set_id", setId);
      if (delErr) {
        console.error(`Failed clearing questions for "${pack.title}":`, delErr.message);
        process.exit(1);
      }
      console.log(`Updated existing set "${pack.title}" (${setId}, published=${existing.published})`);
    } else {
      const { data: created, error: insSetErr } = await supabase
        .from("question_sets")
        .insert({
          title: pack.title,
          subject: pack.subject,
          grade: pack.grade,
          indicator: pack.indicator,
          published: true,
          created_by: creator.id,
        })
        .select("id")
        .single();

      if (insSetErr || !created) {
        console.error(`Failed inserting set "${pack.title}":`, insSetErr?.message);
        process.exit(1);
      }
      setId = created.id;
      console.log(`Created new set "${pack.title}" (${setId}, published=true)`);
    }

    const fullRows = pack.questions.map((q, idx) => ({
      set_id: setId,
      position: idx + 1,
      stem: q.stem,
      options: q.options,
      correct_option: q.correctOption,
      reasons: q.reasons,
      correct_reason: q.correctReason,
      explanation: q.explanation,
      indicator: q.indicator,
      subtopic: q.subtopic,
      cognitive_level: q.cognitiveLevel,
    }));

    const { error: insQErr } = await supabase.from("questions").insert(fullRows);
    if (insQErr) {
      if (isMissingColumnError(insQErr)) {
        metadataColumnsMissing = true;
        const baseRows = pack.questions.map((q, idx) => ({
          set_id: setId,
          position: idx + 1,
          stem: q.stem,
          options: q.options,
          correct_option: q.correctOption,
          reasons: q.reasons,
          correct_reason: q.correctReason,
          explanation: q.explanation,
        }));
        const { error: fallbackErr } = await supabase.from("questions").insert(baseRows);
        if (fallbackErr) {
          console.error(`Fallback question insert failed for "${pack.title}":`, fallbackErr.message);
          process.exit(1);
        }
        console.log(
          `  -> Inserted ${baseRows.length} questions (base columns only; 0005 metadata columns missing on remote DB)`
        );
      } else {
        console.error(`Failed inserting questions for "${pack.title}":`, insQErr.message);
        process.exit(1);
      }
    } else {
      console.log(`  -> Inserted ${fullRows.length} questions with full 0005 kisi-kisi metadata`);
    }
  }

  if (metadataColumnsMissing) {
    console.warn(
      "\n[PERHATIAN] Kolom 0005 (indicator, subtopic, cognitive_level) belum ada di tabel questions Supabase.\n" +
        "Silakan jalankan SQL dari supabase/migrations/0004_profile_grade_username.sql dan 0005_question_indicator.sql\n" +
        "di Supabase SQL Editor, lalu jalankan ulang: node scripts/import-customer-packs.mjs"
    );
  } else {
    console.log("\nSelesai! Semua 40 soal + metadata kisi-kisi tersimpan di Supabase.");
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
