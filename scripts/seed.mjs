// Scripts: seed.mjs
// Seeds initial users (Albus Dumbledore, Severus Snape, Hermione Granger)
// and a complete 6-question 3-tier physics diagnostic test set with pedagogical explanations.
//
// Usage:
//   node scripts/seed.mjs
//   (Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or environment)

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Read .env.local if not already in process.env
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, "$1");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "password123";

const USERS = [
  {
    email: "admin@lms.local",
    full_name: "Albus Dumbledore",
    role: "admin",
  },
  {
    email: "teacher@lms.local",
    full_name: "Severus Snape",
    role: "teacher",
  },
  {
    email: "student@lms.local",
    full_name: "Hermione Granger",
    role: "student",
  },
];

const SEED_QUESTIONS = [
  {
    position: 1,
    stem: "Sebuah balok kayu meluncur di atas permukaan lantai es licin tanpa gesekan dengan kelajuan tetap v. Manakah pernyataan yang paling tepat mengenai gaya yang bekerja pada balok tersebut?",
    options: [
      "Balok tidak membutuhkan resultan gaya sama sekali untuk mempertahankan kelajuannya.",
      "Terdapat resultan gaya dorong ke depan yang besarnya konstan menjaga balok bergerak.",
      "Gaya inersia mendorong balok maju searah dengan arah vektor kecepatannya.",
      "Gaya gesek es bekerja seimbang dengan gaya dorong awal saat balok dilepaskan."
    ],
    correct_option: 0,
    reasons: [
      "Berdasarkan Hukum I Newton, jika resultan gaya sama dengan nol, benda bergerak akan terus bergerak dengan kecepatan konstan tanpa perlu gaya luar.",
      "Setiap benda yang bergerak pasti selalu memiliki gaya aktif yang bekerja searah geraknya.",
      "Inersia adalah sebuah gaya reaksi yang dihasilkan materi ketika bergerak bebas.",
      "Gaya aksi dan reaksi bekerja pada benda yang sama sehingga saling meniadakan di permukaan es."
    ],
    correct_reason: 0,
    explanation: "Berdasarkan Hukum I Newton (Kelembaman), resultan gaya (ΣF = 0) membuat benda yang sudah bergerak lurus akan mempertahankan kelajuannya tanpa memerlukan gaya luar terus-menerus. Miskonsepsi umum menganggap bahwa setiap gerakan membutuhkan gaya pendorong yang bekerja terus-menerus."
  },
  {
    position: 2,
    stem: "Sebuah truk besar bermassa 5.000 kg menabrak sebuah mobil kecil bermassa 1.000 kg yang sedang berhenti di lampu merah. Bagaimanakah perbandingan besar gaya tumbukan yang dialami kedua kendaraan?",
    options: [
      "Besar gaya yang dialami mobil kecil sama persis dengan besar gaya yang dialami truk besar.",
      "Gaya tumbukan yang dialami mobil kecil jauh lebih besar karena massanya jauh lebih kecil.",
      "Gaya tumbukan yang dialami truk lebih besar karena memiliki massa dan momentum lebih masif.",
      "Mobil kecil hanya menerima gaya dan tidak memberikan gaya balik kepada truk besar."
    ],
    correct_option: 0,
    reasons: [
      "Sesuai Hukum III Newton, gaya aksi dan reaksi selalu sama besar dan berlawanan arah meskipun massa kedua benda berbeda.",
      "Benda dengan massa lebih kecil selalu mengalami gaya kontak yang lebih destruktif.",
      "Momentum truk yang lebih besar menyebabkan gaya impak truk lebih mendominasi.",
      "Gaya sebanding langsung dengan massa, sehingga massa truk menghasilkan gaya lebih besar."
    ],
    correct_reason: 0,
    explanation: "Hukum III Newton menetapkan bahwa gaya aksi dan reaksi selalu bernilai sama besar (|F_aksi| = |F_reaksi|), berlawanan arah, dan bekerja pada benda berbeda. Kerusakan mobil kecil lebih parah bukan karena menerima gaya lebih besar, melainkan karena percepatan dan deformasi mobil kecil lebih tinggi (a = F/m)."
  },
  {
    position: 3,
    stem: "Sebuah roket dapat meluncur ke atas di luar angkasa hampa udara. Prinsip fisis apa yang memungkinkan roket tersebut terdorong maju tanpa ada udara di sekitarnya?",
    options: [
      "Gas buang yang disemburkan roket ke bawah memberikan gaya reaksi dorong ke atas pada roket.",
      "Gas buang mendorong udara atmosfer bumi yang berada jauh di bawah roket.",
      "Tekanan hampa udara di luar angkasa menarik moncong roket bergerak ke depan.",
      "Roket melepaskan medan gravitasi bumi sehingga melesat bebas tanpa hambatan."
    ],
    correct_option: 0,
    reasons: [
      "Gaya dorong timbul dari semburan massa gas ke belakang yang menghasilkan gaya reaksi balik ke depan pada badan roket (Hukum III Newton).",
      "Roket memerlukan medium partikel udara untuk memantulkan tekanan gas buang.",
      "Ruang hampa memiliki kerapatan massa negatif yang menghisap materi bergerak maju.",
      "Hilangnya gaya gravitasi otomatis menghasilkan gaya percepatan konstan pada benda bermassa."
    ],
    correct_reason: 0,
    explanation: "Roket tidak memerlukan udara untuk 'mendorong'. Menurut Hukum III Newton dan kekekalan momentum, dorongan ke depan timbul karena semburan massa gas berkecepatan tinggi ke belakang memberikan gaya reaksi langsung ke depan pada badan roket."
  },
  {
    position: 4,
    stem: "Sebuah benda berada dalam lift yang bergerak ke atas dengan percepatan konstan a. Bagaimanakah pembacaan gaya normal (berat semu) pada timbangan di bawah kaki penumpang bermassa m?",
    options: [
      "Gaya normal lebih besar daripada berat gravitasi benda sebenarnya (N = m(g + a)).",
      "Gaya normal sama dengan berat gravitasi sebenarnya karena massa benda tidak berubah.",
      "Gaya normal lebih kecil daripada berat gravitasi benda sebenarnya (N = m(g - a)).",
      "Gaya normal bernilai nol karena penumpang berada dalam kondisi gerak bebas."
    ],
    correct_option: 0,
    reasons: [
      "Lantai lift harus mengerahkan gaya normal lebih besar untuk mempercepat penumpang ke atas melawan gravitasi (N - mg = ma).",
      "Gaya gravitasi bumi selalu konstan sehingga gaya kontak lantai timbangan tidak pernah berubah.",
      "Percepatan ke atas mengompresi gravitasi sehingga mengurangi tekanan berat pada timbangan.",
      "Inersia penumpang meniadakan gaya kontak timbangan selama lift bergerak lurus beraturan."
    ],
    correct_reason: 0,
    explanation: "Dengan menerapkan Hukum II Newton pada penumpang (arah ke atas positif): ΣF = N - W = ma, sehingga N = m(g + a). Karena lift berakselerasi ke atas, lantai timbangan harus mendorong lebih kuat dari berat beban untuk menghasilkan percepatan ke atas."
  },
  {
    position: 5,
    stem: "Dua benda A dan B masing-masing bermassa 2 kg dan 4 kg ditarik dengan resultan gaya yang sama besar F di atas lantai licin. Bagaimanakah perbandingan percepatan benda A terhadap benda B?",
    options: [
      "Percepatan benda A adalah dua kali percepatan benda B (a_A = 2 * a_B).",
      "Percepatan benda A sama dengan percepatan benda B karena ditarik dengan gaya yang sama.",
      "Percepatan benda A adalah setengah dari percepatan benda B (a_A = 0.5 * a_B).",
      "Benda B memiliki percepatan empat kali lebih besar karena memiliki inersia lebih stabil."
    ],
    correct_option: 0,
    reasons: [
      "Berdasarkan Hukum II Newton (a = F/m), untuk gaya yang konstan, percepatan berbanding terbalik dengan massa benda.",
      "Gaya adalah faktor penentu tunggal percepatan benda, mengabaikan perbedaan inersia massa.",
      "Massa yang lebih besar memberikan daya dorong lebih kuat sehingga menghasilkan percepatan lebih tinggi.",
      "Energi kinetik yang ditransfer selalu sebanding kuadrat dari rasio massa kedua benda."
    ],
    correct_reason: 0,
    explanation: "Sesuai Hukum II Newton, percepatan berbanding lurus dengan resultan gaya dan berbanding terbalik dengan massa (a = F/m). Dengan gaya yang sama F, benda A bermassa 2 kg akan mengalami percepatan dua kali lipat dibandingkan benda B bermassa 4 kg."
  },
  {
    position: 6,
    stem: "Seorang anak menarik gerobak di atas tanah kasar dengan gaya horizontal F. Gerobak bergerak lurus dengan kecepatan konstan. Berapakah besar gaya gesek yang dialami gerobak?",
    options: [
      "Besar gaya gesek sama persis dengan besar gaya tarik horizontal F anak tersebut.",
      "Besar gaya gesek lebih kecil daripada gaya tarik F agar gerobak dapat terus bergerak maju.",
      "Besar gaya gesek lebih besar daripada gaya tarik F karena lantai tanah bersifat kasar.",
      "Gaya gesek bernilai nol karena gerobak telah berada dalam kondisi gerak aktif."
    ],
    correct_option: 0,
    reasons: [
      "Kecepatan konstan berarti percepatan a = 0, sehingga resultan gaya ΣF = F_tarik - f_gesek = 0, yang berarti F_tarik = f_gesek.",
      "Benda yang bergerak selalu membutuhkan kelebihan gaya dorong di atas gaya gesekan.",
      "Tanah kasar memicu gaya tahanan yang melebihi gaya luar sebelum terjadi selip.",
      "Gaya gesek statis hanya bekerja sebelum benda bergerak, lalu lenyap saat bergerak."
    ],
    correct_reason: 0,
    explanation: "Karena gerobak bergerak dengan kecepatan konstan (a = 0), menurut Hukum I Newton resultan gayanya harus nol (ΣF = 0). Maka gaya tarik ke depan dan gaya gesek kinetik ke belakang harus sama besar (F - f_k = 0 → f_k = F). Banyak siswa salah mengira bahwa untuk terus bergerak, gaya tarik harus lebih besar daripada gaya gesek."
  }
];

async function seed() {
  console.log("🚀 Starting Supabase Seed: Hogwarts Accounts & 3-Tier Diagnostic Physics Pack...\n");

  const createdUserIds = {};

  // 1. Seed or update users
  for (const user of USERS) {
    console.log(`Checking user: ${user.email} (${user.role} - ${user.full_name})...`);

    let userId = null;

    // Check if user already exists
    const { data: existingList, error: listError } = await admin.auth.admin.listUsers();
    if (!listError && existingList?.users) {
      const match = existingList.users.find((u) => u.email === user.email);
      if (match) {
        userId = match.id;
        console.log(`  ↳ User exists with ID: ${userId}`);
      }
    }

    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password: PASSWORD,
        email_confirm: true,
      });

      if (error) {
        console.error(`  ❌ Failed to create auth user ${user.email}:`, error.message);
        continue;
      }
      userId = data.user.id;
      console.log(`  ✓ Created auth user with ID: ${userId}`);
    }

    createdUserIds[user.role] = userId;

    // Upsert Profile
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        role: user.role,
        full_name: user.full_name,
      });

    if (profileError) {
      console.error(`  ❌ Failed to upsert profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`  ✓ Upserted profile: ${user.full_name} [${user.role}]`);
    }
  }

  // 2. Seed Question Set & Questions
  const teacherId = createdUserIds["teacher"] || createdUserIds["admin"];
  console.log("\n📦 Seeding 3-Tier Diagnostic Question Set (Fisika - Hukum Newton)...");

  // Check if set already exists
  const { data: existingSets } = await admin
    .from("question_sets")
    .select("id")
    .eq("title", "Hukum Newton tentang Gerak dan Gaya")
    .limit(1);

  let setId = existingSets?.[0]?.id;

  if (!setId) {
    const { data: newSet, error: setError } = await admin
      .from("question_sets")
      .insert({
        title: "Hukum Newton tentang Gerak dan Gaya",
        indicator: "Menganalisis hubungan antara gaya, massa, dan percepatan benda pada gerak lurus (Hukum I, II, dan III Newton) serta mengatasi miskonsepsi gaya gerak konstan.",
        subject: "Fisika",
        grade: "Kelas 10",
        published: true,
        created_by: teacherId,
      })
      .select("id")
      .single();

    if (setError || !newSet) {
      console.error("❌ Failed to create question set:", setError?.message);
      return;
    }
    setId = newSet.id;
    console.log(`  ✓ Created question set with ID: ${setId}`);
  } else {
    console.log(`  ↳ Question set already exists with ID: ${setId}`);
    // Clear old questions for this set to keep positions clean
    await admin.from("questions").delete().eq("set_id", setId);
  }

  // Insert questions
  const questionsToInsert = SEED_QUESTIONS.map((q) => ({
    set_id: setId,
    position: q.position,
    stem: q.stem,
    options: q.options,
    correct_option: q.correct_option,
    reasons: q.reasons,
    correct_reason: q.correct_reason,
    explanation: q.explanation,
  }));

  const { error: questionsError } = await admin.from("questions").insert(questionsToInsert);

  if (questionsError) {
    console.error("❌ Failed to insert questions:", questionsError.message);
  } else {
    console.log(`  ✓ Successfully inserted ${SEED_QUESTIONS.length} 3-tier diagnostic questions with explanations.`);
  }

  console.log("\n✨ Seeding completed successfully!");
  console.log("-------------------------------------------------------");
  console.log("Credentials:");
  console.log("  🎓 Student: student@lms.local / password123 (Hermione Granger)");
  console.log("  👩‍🏫 Teacher: teacher@lms.local / password123 (Severus Snape)");
  console.log("  ⚙  Admin:   admin@lms.local   / password123 (Albus Dumbledore)");
  console.log("-------------------------------------------------------\n");
}

seed().catch((err) => {
  console.error("Fatal error during seed:", err);
  process.exit(1);
});
