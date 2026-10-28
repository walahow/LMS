import { cookies } from "next/headers";
// lib/admin-data.ts - Mock and server data helpers for Admin Unified Hub

export type AdminProfile = {
  id: string;
  fullName: string;
  email: string;
  role: "admin";
  initials: string;
};

export type AdminQuestionOption = {
  text: string;
  isCorrect: boolean;
};

export type AdminQuestion = {
  id: string;
  position: number;
  stem: string;
  options: string[];
  correctOption: number;
  reasons: string[];
  correctReason: number;
};

export type AdminQuestionSet = {
  id: string;
  title: string;
  indicator: string;
  subject: string;
  grade: string;
  difficulty: "mudah" | "sedang" | "sulit";
  published: boolean;
  questionCount: number;
  createdAt: string;
  questions?: AdminQuestion[];
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "teacher" | "admin";
  grade?: string;
  initials: string;
  createdAt: string;
};

export type AdminStats = {
  totalSets: number;
  publishedSets: number;
  draftSets: number;
  totalQuestions: number;
  totalUsers: number;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
};

// =========================================================================
// MOCK DATA RECONCILED WITH TEACHER & STUDENT DASHBOARDS
// =========================================================================

export const MOCK_ADMIN_PROFILE: AdminProfile = {
  id: "adm-01",
  fullName: "Pak Andi Kurniawan",
  email: "admin@lms.local",
  role: "admin",
  initials: "AK",
};

export const MOCK_ADMIN_SETS: AdminQuestionSet[] = [
  {
    id: "mock-pack-1",
    title: "Hukum Newton & Dinamika Gerak",
    indicator: "Menganalisis hubungan antara gaya, massa, dan percepatan pada gerak lurus benda serta penerapannya dalam kehidupan sehari-hari.",
    subject: "Fisika",
    grade: "Kelas 10",
    difficulty: "sedang",
    published: true,
    questionCount: 6,
    createdAt: "15 Sep 2026",
    questions: [
      {
        id: "fis-q1",
        position: 1,
        stem: "Sebuah balok di lantai licin didorong dengan gaya konstan F sehingga bergerak dengan percepatan a. Jika gaya dorong diperbesar menjadi 2F sedangkan massa balok tetap, bagaimanakah percepatan balok sekarang?",
        options: [
          "Menjadi 2a (dua kali lebih besar)",
          "Tetap a karena massa balok tidak berubah",
          "Menjadi 1/2 a (setengah kali semula)",
          "Menjadi 4a (empat kali lebih besar)",
        ],
        correctOption: 0,
        reasons: [
          "Berdasarkan Hukum II Newton (a = ΣF / m), percepatan berbanding lurus dengan resultan gaya pada massa tetap",
          "Percepatan hanya ditentukan oleh massa benda, gaya luar hanya mempertahankan gerak",
          "Gaya yang membesar memerlukan waktu adaptasi inersia sehingga percepatannya teredam",
          "Percepatan sebanding dengan kuadrat gaya yang bekerja pada sistem",
        ],
        correctReason: 0,
      },
      {
        id: "fis-q2",
        position: 2,
        stem: "Dua benda A dan B masing-masing bermassa m dan 2m didorong dengan gaya yang sama besar pada lantai licin. Bagaimanakah perbandingan percepatan benda A terhadap benda B (aA : aB)?",
        options: [
          "Percepatan benda A dua kali percepatan benda B (2 : 1)",
          "Percepatan benda A sama dengan percepatan benda B (1 : 1)",
          "Percepatan benda A setengah kali percepatan benda B (1 : 2)",
          "Percepatan benda A empat kali percepatan benda B (4 : 1)",
        ],
        correctOption: 0,
        reasons: [
          "Percepatan berbanding terbalik dengan massa benda (a = F / m), maka benda bermassa lebih kecil memiliki percepatan lebih besar",
          "Karena gaya dorong yang diberikan sama besar, percepatannya pasti identik",
          "Benda bermassa lebih besar memiliki inersia gerak yang lebih kuat sehingga melaju lebih cepat",
          "Percepatan benda berbanding lurus dengan kuadrat massa",
        ],
        correctReason: 0,
      },
      {
        id: "fis-q3",
        position: 3,
        stem: "Sebuah roket dapat meluncur ke angkasa luar yang hampa udara. Prinsip hukum fisika manakah yang mendasari peristiwa tersebut?",
        options: [
          "Hukum III Newton (Aksi - Reaksi semburan gas)",
          "Hukum Kelembaman I Newton",
          "Gaya gesek roket dengan partikel udara",
          "Gaya gravitasi bumi yang menarik roket ke atas",
        ],
        correctOption: 0,
        reasons: [
          "Gas hasil pembakaran didorong ke bawah (aksi), dan gas mendorong balik badan roket ke atas dengan gaya yang sama besar (reaksi)",
          "Roket membutuhkan udara luar untuk bertumpu dan mendorong badannya",
          "Hampa udara menghilangkan hambatan gesek sehingga roket langsung melesat sendiri",
          "Massa roket berkurang drastis sehingga percepatannya tak terhingga",
        ],
        correctReason: 0,
      },
      {
        id: "fis-q4",
        position: 4,
        stem: "Sebuah mobil mengerem mendadak dan penumpangnya terdorong ke depan. Peristiwa ini merupakan contoh penerapan dari:",
        options: [
          "Hukum I Newton (Inersia / Kelembaman)",
          "Hukum II Newton tentang percepatan",
          "Hukum III Newton tentang aksi-reaksi",
          "Hukum Kekekalan Energi Mekanik",
        ],
        correctOption: 0,
        reasons: [
          "Tubuh penumpang cenderung mempertahankan keadaan geraknya ke depan saat mobil melambat",
          "Ada gaya dorong misterius dari kursi mobil ke arah depan ketika rem diinjak",
          "Gaya gesek ban mobil memindahkan momentum ke tubuh penumpang",
          "Gravitasi bumi menarik tubuh penumpang ke arah kaca depan",
        ],
        correctReason: 0,
      },
      {
        id: "fis-q5",
        position: 5,
        stem: "Benda bergerak lurus beraturan (GLB) dengan kecepatan konstan 10 m/s. Berapakah resultan gaya total yang bekerja pada benda?",
        options: [
          "Resultan gaya sama dengan nol",
          "Resultan gaya sebesar 10 Newton",
          "Resultan gaya positif sebanding massa benda",
          "Resultan gaya tak hingga",
        ],
        correctOption: 0,
        reasons: [
          "Sesuai Hukum I Newton, kecepatan konstan berarti tidak ada percepatan (ΣF = 0)",
          "Dibutuhkan gaya konstan agar benda tetap bisa mempertahankan kecepatannya",
          "Gaya dorong harus selalu lebih besar dari nol agar tidak berhenti",
          "Energi kinetik membutuhkan resultan gaya konstan",
        ],
        correctReason: 0,
      },
      {
        id: "fis-q6",
        position: 6,
        stem: "Sebuah buku diletakkan diam di atas meja. Manakah pernyataan yang benar mengenai pasangan gaya aksi-reaksi Hukum III Newton?",
        options: [
          "Gaya tekan buku pada meja dan gaya normal meja pada buku",
          "Gaya berat buku dan gaya normal meja pada buku",
          "Gaya gravitasi bumi pada buku dan gaya normal meja pada buku",
          "Gaya gesek meja dan gaya berat buku",
        ],
        correctOption: 0,
        reasons: [
          "Gaya aksi-reaksi bekerja pada dua benda berbeda dan berlawanan arah",
          "Kedua gaya saling meniadakan karena berada pada benda yang sama sehingga diam",
          "Gaya normal adalah akibat langsung dari gravitasi bumi",
          "Gaya aksi dan reaksi selalu berada pada satu titik tangkap",
        ],
        correctReason: 0,
      },
    ],
  },
  {
    id: "mock-pack-2",
    title: "Metabolisme & Enzim Seluler",
    indicator: "Menjelaskan mekanisme kerja enzim sebagai biokatalisator serta faktor-faktor lingkungan yang memengaruhi aktivitas katalitiknya.",
    subject: "Biologi",
    grade: "Kelas 11",
    difficulty: "sedang",
    published: true,
    questionCount: 4,
    createdAt: "16 Sep 2026",
    questions: [
      {
        id: "bio-q1",
        position: 1,
        stem: "Enzim mempercepat laju reaksi metabolisme di dalam sel dengan cara:",
        options: [
          "Menurunkan energi aktivasi reaksi",
          "Menaikkan energi kinetik molekul substrat",
          "Mengubah kesetimbangan akhir reaksi kimia",
          "Menyediakan energi panas bagi sel",
        ],
        correctOption: 0,
        reasons: [
          "Enzim menstabilkan kompleks transisi substrat sehingga energi aktivasi minimum yang diperlukan menjadi lebih rendah",
          "Enzim bertindak sebagai sumber energi termal utama bagi ikatan kovalen",
          "Enzim ikut habis bereaksi dan menjadi bagian dari produk akhir",
          "Enzim mempercepat reaksi dengan cara meningkatkan suhu lokal sel",
        ],
        correctReason: 0,
      },
      {
        id: "bio-q2",
        position: 2,
        stem: "Apa yang terjadi pada sisi aktif enzim ketika dipanaskan melebihi suhu optimumnya (misalnya di atas 60°C)?",
        options: [
          "Mengalami denaturasi dan kehilangan fungsi katalitik",
          "Bekerja semakin cepat karena molekul semakin aktif",
          "Mengubah substrat menjadi inhibitor permanen",
          "Tidak terpengaruh karena enzim bersifat termostabil",
        ],
        correctOption: 0,
        reasons: [
          "Panas berlebih memutus ikatan hidrogen dan interaksi lemah yang mempertahankan struktur tersier sisi aktif enzim",
          "Suhu tinggi hanya mempercepat pengikatan substrat tanpa mengubah struktur",
          "Suhu tinggi mengubah kofaktor menjadi koenzim",
          "Sisi aktif enzim terbuat dari lipid sehingga mencair secara reversibel",
        ],
        correctReason: 0,
      },
      {
        id: "bio-q3",
        position: 3,
        stem: "Inhibitor kompetitif menghambat kerja enzim dengan mekanisme:",
        options: [
          "Menempati sisi aktif enzim karena memiliki bentuk menyerupai substrat",
          "Mengikat sisi alosterik dan mengubah konformasi sisi aktif",
          "Merusak substrat sebelum sempat berikatan dengan enzim",
          "Menurunkan konsentrasi kofaktor dalam sitoplasma",
        ],
        correctOption: 0,
        reasons: [
          "Struktur inhibitor kompetitif mirip dengan substrat sehingga bersaing memperebutkan sisi aktif enzim",
          "Inhibitor kompetitif selalu berikatan pada bagian luar di luar sisi aktif",
          "Inhibitor kompetitif mengurai molekul enzim menjadi asam amino",
          "Hambatan kompetitif tidak dapat diatasi dengan penambahan substrat",
        ],
        correctReason: 0,
      },
      {
        id: "bio-q4",
        position: 4,
        stem: "Bagian non-protein dari enzim yang berupa molekul organik kompleks disebut:",
        options: [
          "Koenzim",
          "Apoenzim",
          "Kofaktor anorganik",
          "Holoenzim",
        ],
        correctOption: 0,
        reasons: [
          "Koenzim adalah senyawa organik non-protein (seperti vitamin B, NAD+, FAD) yang membantu fungsi katalisis",
          "Apoenzim adalah bagian protein dari enzim yang inaktif tanpa kofaktor",
          "Holoenzim adalah keseluruhan enzim aktif yang sudah lengkap",
          "Kofaktor anorganik merujuk pada ion logam seperti Fe2+ atau Mg2+",
        ],
        correctReason: 0,
      },
    ],
  },
  {
    id: "mock-pack-3",
    title: "Ikatan Kimia & Struktur Molekul",
    indicator: "Membedakan pembentukan ikatan ion, kovalen polar, dan kovalen nonpolar berdasarkan perbedaan elektronegativitas dan transfer elektron.",
    subject: "Kimia",
    grade: "Kelas 10",
    difficulty: "sedang",
    published: false,
    questionCount: 4,
    createdAt: "20 Sep 2026",
    questions: [
      {
        id: "kim-q1",
        position: 1,
        stem: "Ikatan ion umumnya terbentuk antara unsur:",
        options: [
          "Logam dengan non-logam melalui serah terima elektron",
          "Non-logam dengan non-logam melalui pemakaian elektron bersama",
          "Logam dengan logam melalui lautan elektron",
          "Gas mulia dengan halogen melalui gaya van der Waals",
        ],
        correctOption: 0,
        reasons: [
          "Unsur logam melepaskan elektron membentuk kation dan unsur non-logam menangkap elektron membentuk anion",
          "Keduanya saling menarik elektron bersama secara simetris",
          "Perbedaan elektronegativitas yang sangat kecil memicu ikatan elektrostatik",
          "Transfer proton antar inti atom menghasilkan gaya tarik ionik",
        ],
        correctReason: 0,
      },
      {
        id: "kim-q2",
        position: 2,
        stem: "Molekul air (H2O) bersifat polar terutama karena:",
        options: [
          "Bentuk molekul asimetris (bengkok) dan terdapat perbedaan elektronegativitas yang signifikan",
          "Terdapat ikatan hidrogen di dalam satu molekul H2O tunggal",
          "Atom oksigen melepaskan elektron kepada hidrogen",
          "Muatan total molekul air adalah negatif",
        ],
        correctOption: 0,
        reasons: [
          "Pasangan elektron bebas pada atom O mendesak ikatan membentuk sudut bengkok sehingga momen dipol tidak saling meniadakan",
          "Semua molekul dengan unsur hidrogen otomatis berwujud polar",
          "Molekul air memiliki muatan ionik bersih yang terurai di udara",
          "Bentuk linier air menghasilkan resultan vektor dipol positif",
        ],
        correctReason: 0,
      },
      {
        id: "kim-q3",
        position: 3,
        stem: "Senyawa manakah di bawah ini yang memiliki ikatan kovalen nonpolar sempurna?",
        options: [
          "Gas Oksigen (O2)",
          "Asam Klorida (HCl)",
          "Amonia (NH3)",
          "Natrium Klorida (NaCl)",
        ],
        correctOption: 0,
        reasons: [
          "Dua atom oksigen yang identik memiliki perbedaan elektronegativitas sama dengan nol sehingga distribusi elektron simetris",
          "Gas oksigen bermassa molekul genap sehingga tidak memiliki kutub",
          "Oksigen merupakan gas mulia yang stabil tanpa dipol",
          "Ikatan nonpolar hanya terjadi pada gas bertekanan tinggi",
        ],
        correctReason: 0,
      },
      {
        id: "kim-q4",
        position: 4,
        stem: "Karakteristik fisik khas dari senyawa ionik dalam wujud padat adalah:",
        options: [
          "Titik leleh tinggi dan tidak menghantarkan arus listrik dalam wujud padat",
          "Titik leleh sangat rendah dan mudah menguap pada suhu ruang",
          "Konduktor listrik yang baik dalam wujud kristal padat",
          "Bersifat lunak dan sangat lentur saat ditempa",
        ],
        correctOption: 0,
        reasons: [
          "Gaya elektrostatik kisi kristal sangat kuat, dan ion-ionnya terikat kaku sehingga tidak bebas bergerak menghantar arus dalam wujud padat",
          "Ion dalam kisi kristal padat dapat mengalir bebas seperti elektron bebas",
          "Senyawa ionik berikatan kovalen lemah sehingga mudah patah",
          "Senyawa ionik tidak memiliki ion bermuatan di dalamnya",
        ],
        correctReason: 0,
      },
    ],
  },
  {
    id: "mock-pack-4",
    title: "Tektonisme & Vulkanisme",
    indicator: "Mengidentifikasi tipe-tipe batas lempeng tektonik serta fenomena geologis yang menyertainya seperti gempa bumi dan busur vulkanik.",
    subject: "Geografi",
    grade: "Kelas 10",
    difficulty: "sulit",
    published: false,
    questionCount: 4,
    createdAt: "22 Sep 2026",
    questions: [
      {
        id: "geo-q1",
        position: 1,
        stem: "Batas lempeng konvergen antara lempeng samudera dan lempeng benua menghasilkan fenomena geologi berupa:",
        options: [
          "Zona subduksi, palung laut dalam, dan busur pegunungan vulkanik",
          "Pematang tengah samudera (mid-ocean ridge) dan perluasan dasar laut",
          "Patahan mendatar geser (transform fault) tanpa aktivitas magma",
          "Lembah retakan benua (rift valley)",
        ],
        correctOption: 0,
        reasons: [
          "Lempeng samudera yang lebih padat menunjam ke bawah lempeng benua membentuk palung dan pelelehan batuan memicu magma naik ke permukaan",
          "Kedua lempeng saling menjauh sehingga magma dasar samudera mendingin membentuk punggungan baru",
          "Subduksi hanya terjadi jika kedua lempeng memiliki massa jenis yang persis sama",
          "Zona subduksi tidak pernah menghasilkan aktivitas seismik maupun vulkanik",
        ],
        correctReason: 0,
      },
      {
        id: "geo-q2",
        position: 2,
        stem: "Patahan San Andreas di California merupakan contoh nyata dari batas lempeng bertipe:",
        options: [
          "Transform (sesar mendatar)",
          "Konvergen (tumbukan)",
          "Divergen (pemekaran)",
          "Hotspot intra-lempeng",
        ],
        correctOption: 0,
        reasons: [
          "Dua lempeng saling bergesekan secara horisontal tanpa pembentukan atau penghancuran kerak bumi",
          "Lempeng Pasifik menunjam ke bawah lempeng Amerika Utara",
          "Magma keluar memisahkan lempeng benua menjadi dua bagian",
          "Patahan San Andreas terbentuk akibat aktivitas gunung api tunggal di tengah lempeng",
        ],
        correctReason: 0,
      },
      {
        id: "geo-q3",
        position: 3,
        stem: "Mengapa kawasan 'Ring of Fire' (Cincin Api Pasifik) memiliki konsentrasi gempa bumi dan gunung api aktif tertinggi di dunia?",
        options: [
          "Dikelilingi oleh zona subduksi lempeng tektonik yang saling bertumbukan aktif",
          "Karena kedalaman Samudera Pasifik paling dalam di bumi",
          "Lapisan atmosfer di atas samudra tersebut lebih tipis sehingga panas bumi mudah keluar",
          "Bumi berputar lebih cepat di wilayah Pasifik sehingga kerak bumi pecah",
        ],
        correctOption: 0,
        reasons: [
          "Pertemuan lempeng-lempeng litosfer di sepanjang tepi Samudera Pasifik mengalami penunjaman terus-menerus yang memicu magma dan gempa",
          "Dasar samudra Pasifik seluruhnya terbuat dari magma cair tanpa lempeng padat",
          "Cincin api terbentuk semata-mata karena tarikan gravitasi pasang surut bulan",
          "Zona gempa Pasifik tidak berkaitan dengan dinamika lempeng tektonik",
        ],
        correctReason: 0,
      },
      {
        id: "geo-q4",
        position: 4,
        stem: "Gunung api tipe strato (kerucut berlapis) yang umum ditemukan di Indonesia memiliki ciri letusan:",
        options: [
          "Campuran efusif dan eksplosif akibat lava yang kental (viskositas tinggi) kaya silika",
          "Hanya efusif lelehan lava sangat encer seperti di kepulauan Hawaii",
          "Hanya berupa letusan gas tanpa material padat piroklastik",
          "Tidak pernah erupsi kembali setelah satu kali letusan awal",
        ],
        correctOption: 0,
        reasons: [
          "Magma andesitik yang kaya silika menjebak gas bertekanan tinggi sehingga bergantian mengeluarkan endapan piroklastik dan aliran lava",
          "Magma Indonesia bersifat basal murni sangat encer sehingga tidak membentuk kubah kerucut",
          "Bentuk strato terbentuk dari akumulasi abu dingin dari luar angkasa",
          "Tekanan gas selalu konstan rendah pada busur vulkanik subduksi",
        ],
        correctReason: 0,
      },
    ],
  },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  // Admin
  { id: "adm-01", fullName: "Pak Andi Kurniawan", email: "admin@lms.local", role: "admin", initials: "AK", createdAt: "01 Sep 2026" },
  // Teachers (3)
  { id: "tch-01", fullName: "Bu Sari Wulandari, M.Pd.", email: "teacher@lms.local", role: "teacher", initials: "SW", createdAt: "02 Sep 2026" },
  { id: "tch-02", fullName: "Drs. Bambang Sudiro", email: "bambang@lms.local", role: "teacher", initials: "BS", createdAt: "03 Sep 2026" },
  { id: "tch-03", fullName: "Dewi Lestari, S.Pd.", email: "dewi@lms.local", role: "teacher", initials: "DL", createdAt: "05 Sep 2026" },
  // Students (28)
  { id: "std-01", fullName: "Rani Putri", email: "rani@lms.local", role: "student", grade: "Kelas X-A", initials: "RP", createdAt: "10 Sep 2026" },
  { id: "std-02", fullName: "Budi Santoso", email: "budi@lms.local", role: "student", grade: "Kelas X-A", initials: "BS", createdAt: "10 Sep 2026" },
  { id: "std-03", fullName: "Siti Rahma", email: "siti@lms.local", role: "student", grade: "Kelas X-B", initials: "SR", createdAt: "10 Sep 2026" },
  { id: "std-04", fullName: "Dimas Pratama", email: "dimas@lms.local", role: "student", grade: "Kelas X-B", initials: "DP", createdAt: "10 Sep 2026" },
  { id: "std-05", fullName: "Ayu Anindita", email: "ayu@lms.local", role: "student", grade: "Kelas X-A", initials: "AA", createdAt: "11 Sep 2026" },
  { id: "std-06", fullName: "Bayu Wicaksono", email: "bayu@lms.local", role: "student", grade: "Kelas X-A", initials: "BW", createdAt: "11 Sep 2026" },
  { id: "std-07", fullName: "Citra Kirana", email: "citra@lms.local", role: "student", grade: "Kelas X-B", initials: "CK", createdAt: "11 Sep 2026" },
  { id: "std-08", fullName: "Dian Permata", email: "dian@lms.local", role: "student", grade: "Kelas X-B", initials: "DP", createdAt: "11 Sep 2026" },
  { id: "std-09", fullName: "Eko Prasetyo", email: "eko@lms.local", role: "student", grade: "Kelas X-A", initials: "EP", createdAt: "11 Sep 2026" },
  { id: "std-10", fullName: "Fani Rahmawati", email: "fani@lms.local", role: "student", grade: "Kelas X-A", initials: "FR", createdAt: "11 Sep 2026" },
  { id: "std-11", fullName: "Gilang Ramadhan", email: "gilang@lms.local", role: "student", grade: "Kelas X-B", initials: "GR", createdAt: "11 Sep 2026" },
  { id: "std-12", fullName: "Hana Safitri", email: "hana@lms.local", role: "student", grade: "Kelas X-B", initials: "HS", createdAt: "11 Sep 2026" },
  { id: "std-13", fullName: "Indra Lesmana", email: "indra@lms.local", role: "student", grade: "Kelas X-A", initials: "IL", createdAt: "12 Sep 2026" },
  { id: "std-14", fullName: "Joko Nugroho", email: "joko@lms.local", role: "student", grade: "Kelas X-A", initials: "JN", createdAt: "12 Sep 2026" },
  { id: "std-15", fullName: "Kartika Sari", email: "kartika@lms.local", role: "student", grade: "Kelas X-B", initials: "KS", createdAt: "12 Sep 2026" },
  { id: "std-16", fullName: "Lukman Hakim", email: "lukman@lms.local", role: "student", grade: "Kelas X-B", initials: "LH", createdAt: "12 Sep 2026" },
  { id: "std-17", fullName: "Maya Anggraini", email: "maya@lms.local", role: "student", grade: "Kelas X-A", initials: "MA", createdAt: "12 Sep 2026" },
  { id: "std-18", fullName: "Nadia Utami", email: "nadia@lms.local", role: "student", grade: "Kelas X-A", initials: "NU", createdAt: "12 Sep 2026" },
  { id: "std-19", fullName: "Oki Setiawan", email: "oki@lms.local", role: "student", grade: "Kelas X-B", initials: "OS", createdAt: "12 Sep 2026" },
  { id: "std-20", fullName: "Putri Mayasari", email: "putri@lms.local", role: "student", grade: "Kelas X-B", initials: "PM", createdAt: "12 Sep 2026" },
  { id: "std-21", fullName: "Rahmat Hidayat", email: "rahmat@lms.local", role: "student", grade: "Kelas X-A", initials: "RH", createdAt: "12 Sep 2026" },
  { id: "std-22", fullName: "Sinta Dewi", email: "sinta@lms.local", role: "student", grade: "Kelas X-A", initials: "SD", createdAt: "12 Sep 2026" },
  { id: "std-23", fullName: "Teguh Wibowo", email: "teguh@lms.local", role: "student", grade: "Kelas X-B", initials: "TW", createdAt: "12 Sep 2026" },
  { id: "std-24", fullName: "Umar Bakri", email: "umar@lms.local", role: "student", grade: "Kelas X-B", initials: "UB", createdAt: "12 Sep 2026" },
  { id: "std-25", fullName: "Vina Panduwinata", email: "vina@lms.local", role: "student", grade: "Kelas X-A", initials: "VP", createdAt: "12 Sep 2026" },
  { id: "std-26", fullName: "Wahyu Tri", email: "wahyu@lms.local", role: "student", grade: "Kelas X-A", initials: "WT", createdAt: "12 Sep 2026" },
  { id: "std-27", fullName: "Yoga Pratama", email: "yoga@lms.local", role: "student", grade: "Kelas X-B", initials: "YP", createdAt: "12 Sep 2026" },
  { id: "std-28", fullName: "Zahra Salsabila", email: "zahra@lms.local", role: "student", grade: "Kelas X-B", initials: "ZS", createdAt: "12 Sep 2026" },
];

export function calculateAdminStats(sets: AdminQuestionSet[], users: AdminUser[]): AdminStats {
  const publishedSets = sets.filter((s) => s.published).length;
  const draftSets = sets.length - publishedSets;
  const totalQuestions = sets.reduce((acc, s) => acc + (s.questionCount || 0), 0);
  const studentCount = users.filter((u) => u.role === "student").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return {
    totalSets: sets.length,
    publishedSets,
    draftSets,
    totalQuestions,
    totalUsers: users.length,
    studentCount,
    teacherCount,
    adminCount,
  };
}

// =========================================================================
// FETCH HELPERS WITH STANDALONE MOCK FALLBACK
// =========================================================================

export async function fetchAdminData(): Promise<{
  profile: AdminProfile;
  stats: AdminStats;
  questionSets: AdminQuestionSet[];
  users: AdminUser[];
}> {
  let isDemo = false;
  try {
    const cookieStore = await cookies();
    isDemo = Boolean(cookieStore.get("lms-demo-role")?.value);
  } catch {
    // Prerender fallback
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    isDemo
  ) {
    const stats = calculateAdminStats(MOCK_ADMIN_SETS, MOCK_ADMIN_USERS);
    return {
      profile: MOCK_ADMIN_PROFILE,
      stats,
      questionSets: MOCK_ADMIN_SETS,
      users: MOCK_ADMIN_USERS,
    };
  }

  try {
    const { requireRole } = await import("@/lib/auth");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { profile } = await requireRole("admin");
    const admin = createAdminClient();

    const [{ data: dbSets }, { data: dbProfiles }, { data: authUsers }] = await Promise.all([
      admin
        .from("question_sets")
        .select("id, title, indicator, subject, grade, published, created_at")
        .order("created_at", { ascending: false }),
      admin.from("profiles").select("id, role, full_name, created_at").order("full_name"),
      admin.auth.admin.listUsers({ perPage: 200 }),
    ]);

    const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email ?? ""]));

    const sets: AdminQuestionSet[] = (dbSets ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      indicator: s.indicator,
      subject: s.subject || "Umum",
      grade: s.grade || "Semua",
      difficulty: "sedang",
      published: Boolean(s.published),
      questionCount: 0,
      createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString("id-ID") : "Baru saja",
    }));

    const users: AdminUser[] = (dbProfiles ?? []).map((p) => {
      const parts = (p.full_name || "Pengguna").split(" ");
      const initials = parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : (parts[0].slice(0, 2) || "US").toUpperCase();

      return {
        id: p.id,
        fullName: p.full_name,
        email: emailById.get(p.id) || "user@lms.local",
        role: p.role,
        initials,
        createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "10 Sep 2026",
      };
    });

    const adminProfile: AdminProfile = {
      id: profile.id,
      fullName: profile.full_name,
      email: "admin@lms.local",
      role: "admin",
      initials: "AK",
    };

    return {
      profile: adminProfile,
      stats: calculateAdminStats(sets, users),
      questionSets: sets,
      users,
    };
  } catch (error) {
    console.warn("fetchAdminData falling back to mock:", error);
    const stats = calculateAdminStats(MOCK_ADMIN_SETS, MOCK_ADMIN_USERS);
    return {
      profile: MOCK_ADMIN_PROFILE,
      stats,
      questionSets: MOCK_ADMIN_SETS,
      users: MOCK_ADMIN_USERS,
    };
  }
}

export async function fetchAdminSetDetail(id: string): Promise<AdminQuestionSet | null> {
  const mock = MOCK_ADMIN_SETS.find((s) => s.id === id);
  if (mock) return mock;

  let isDemo = false;
  try {
    const cookieStore = await cookies();
    isDemo = Boolean(cookieStore.get("lms-demo-role")?.value);
  } catch {
    // Prerender fallback
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    isDemo
  ) {
    return null;
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: set } = await admin
      .from("question_sets")
      .select("id, title, indicator, subject, grade, published, created_at")
      .eq("id", id)
      .single();

    if (!set) return null;

    const { data: questions } = await admin
      .from("questions")
      .select("id, position, stem, options, correct_option, reasons, correct_reason")
      .eq("set_id", id)
      .order("position");

    return {
      id: set.id,
      title: set.title,
      indicator: set.indicator,
      subject: set.subject || "Umum",
      grade: set.grade || "Semua",
      difficulty: "sedang",
      published: Boolean(set.published),
      questionCount: questions?.length ?? 0,
      createdAt: set.created_at ? new Date(set.created_at).toLocaleDateString("id-ID") : "Baru saja",
      questions: (questions ?? []).map((q) => ({
        id: q.id,
        position: q.position,
        stem: q.stem,
        options: (q.options as string[]) ?? [],
        correctOption: q.correct_option,
        reasons: (q.reasons as string[]) ?? [],
        correctReason: q.correct_reason,
      })),
    };
  } catch {
    return null;
  }
}
