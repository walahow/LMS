import ExcelJS from "exceljs";
import { DIAGNOSIS_LABEL, type Diagnosis } from "@/lib/diagnose";
import type { TeacherTestPack } from "@/lib/teacher-data";

export type ExportQuestionMeta = {
  position: number;
  indicator?: string;
  subtopic?: string;
  cognitiveLevel?: string;
  stem: string;
  correctOption: number;
  correctReason: number;
};

const LETTERS = ["A", "B", "C", "D", "E"] as const;

function toLetter(idx: number): string {
  return idx >= 0 && idx < LETTERS.length ? LETTERS[idx] : "-";
}

function slugifyTitle(title: string): string {
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return cleaned || "paket-tes";
}

export function buildExportFilename(title: string, now = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `hasil-${slugifyTitle(title)}-${yyyy}${mm}${dd}.xlsx`;
}

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF116AF8" },
};

const ZEBRA_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF4F7FC" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD0DAE8" } },
  left: { style: "thin", color: { argb: "FFD0DAE8" } },
  bottom: { style: "thin", color: { argb: "FFD0DAE8" } },
  right: { style: "thin", color: { argb: "FFD0DAE8" } },
};

const DIAGNOSIS_CELL_STYLE: Record<Diagnosis, { bg: string; fg: string }> = {
  paham: { bg: "FFD1FAE5", fg: "FF065F46" },
  miskonsepsi: { bg: "FFFFE4E6", fg: "FF9F1239" },
  lucky_guess: { bg: "FFFEF3C7", fg: "FF92400E" },
  tidak_paham: { bg: "FFE4E4E7", fg: "FF3F3F46" },
};

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 24;
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = THIN_BORDER;
  });
}

function autoFitColumns(sheet: ExcelJS.Worksheet, minWidth = 10, maxWidth = 48) {
  sheet.columns.forEach((col) => {
    let maxLen = minWidth;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value == null ? "" : String(cell.value);
      const longestLine = val.split("\n").reduce((m, s) => Math.max(m, s.length), 0);
      maxLen = Math.max(maxLen, longestLine + 3);
    });
    col.width = Math.min(maxLen, maxWidth);
  });
}

export async function buildSetExportWorkbook(
  pack: TeacherTestPack,
  fallbackQuestions: ExportQuestionMeta[] = [],
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LMS Diagnostik 3-Tier";
  workbook.created = new Date();

  // =========================================================================
  // SHEET 1: Ringkasan Siswa
  // =========================================================================
  const summarySheet = workbook.addWorksheet("Ringkasan Siswa", {
    views: [{ state: "frozen", ySplit: 7 }],
  });

  summarySheet.addRow(["REKAP HASIL TES DIAGNOSTIK 3-TIER"]);
  summarySheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF0B152B" } };
  summarySheet.mergeCells("A1:J1");

  const metaRows: [string, string][] = [
    ["Paket Soal", pack.title],
    ["Mata Pelajaran / Kelas", `${pack.subject} · ${pack.grade || "Kelas 10"}`],
    ["Indikator Pembelajaran", pack.indicator || "-"],
    [
      "Partisipasi Siswa",
      `${pack.studentAttemptCount} / ${pack.totalStudents} siswa mengerjakan · ${pack.questionCount} butir soal`,
    ],
  ];

  metaRows.forEach(([label, val], idx) => {
    const r = summarySheet.addRow([label, val]);
    r.getCell(1).font = { bold: true, size: 10, color: { argb: "FF475569" } };
    r.getCell(2).font = { size: 10, color: { argb: "FF0B152B" } };
    summarySheet.mergeCells(`B${idx + 2}:J${idx + 2}`);
  });

  summarySheet.addRow([]); // row 6 spacer

  const summaryHeader = summarySheet.addRow([
    "No",
    "Nama Siswa",
    "Kelas",
    "Waktu Selesai",
    "Skor Tier 1 (0-100)",
    DIAGNOSIS_LABEL.paham,
    DIAGNOSIS_LABEL.miskonsepsi,
    DIAGNOSIS_LABEL.lucky_guess,
    DIAGNOSIS_LABEL.tidak_paham,
    "Status Dominan",
  ]);
  styleHeaderRow(summaryHeader);

  if (pack.students.length === 0) {
    const emptyRow = summarySheet.addRow([
      "-",
      "Belum ada siswa yang menyelesaikan paket tes ini.",
    ]);
    summarySheet.mergeCells(`B${emptyRow.number}:J${emptyRow.number}`);
    emptyRow.font = { italic: true, color: { argb: "FF64748B" } };
  } else {
    pack.students.forEach((student, idx) => {
      const row = summarySheet.addRow([
        idx + 1,
        student.fullName,
        student.grade || pack.grade || "-",
        student.submittedAt,
        student.score,
        student.diagnosticsCount.paham,
        student.diagnosticsCount.miskonsepsi,
        student.diagnosticsCount.lucky_guess,
        student.diagnosticsCount.tidak_paham,
        DIAGNOSIS_LABEL[student.dominantDiagnosis],
      ]);

      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if (idx % 2 === 1) cell.fill = ZEBRA_FILL;
        cell.alignment = {
          vertical: "middle",
          horizontal: colNum === 2 || colNum === 4 || colNum === 10 ? "left" : "center",
        };
        if (colNum === 5) cell.font = { bold: true };
        if (colNum === 10) {
          const style = DIAGNOSIS_CELL_STYLE[student.dominantDiagnosis];
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.bg } };
          cell.font = { bold: true, color: { argb: style.fg } };
        }
      });
    });

    const avgScore = Math.round(
      pack.students.reduce((sum, s) => sum + s.score, 0) / pack.students.length,
    );
    const totalRow = summarySheet.addRow([
      "",
      "Rata-Rata / Total Kelas",
      "",
      "",
      avgScore,
      pack.diagnosticsCount.paham,
      pack.diagnosticsCount.miskonsepsi,
      pack.diagnosticsCount.lucky_guess,
      pack.diagnosticsCount.tidak_paham,
      "",
    ]);
    totalRow.eachCell((cell, colNum) => {
      cell.border = THIN_BORDER;
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNum === 2 ? "left" : "center",
      };
    });
  }

  autoFitColumns(summarySheet);
  summarySheet.getColumn(1).width = 6;
  summarySheet.getColumn(2).width = 28;
  summarySheet.getColumn(4).width = 22;

  // =========================================================================
  // SHEET 2: Detail Per Soal
  // =========================================================================
  const detailSheet = workbook.addWorksheet("Detail Per Soal", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const detailHeader = detailSheet.addRow([
    "No",
    "Nama Siswa",
    "Kelas",
    "No. Soal",
    "Jawaban Siswa (Tier 1)",
    "Kunci Jawaban",
    "Tier 1 Benar?",
    "Alasan Siswa (Tier 2)",
    "Kunci Alasan",
    "Tier 2 Benar?",
    "Keyakinan (Tier 3)",
    "Diagnosis 3-Tier",
  ]);
  styleHeaderRow(detailHeader);

  let detailRowIdx = 0;
  for (const student of pack.students) {
    const sortedQs = [...student.questions].sort((a, b) => a.position - b.position);
    for (const q of sortedQs) {
      detailRowIdx += 1;
      const t1Ok = q.studentAnswer === q.correctOption;
      const t2Ok = q.studentReason === q.correctReason;
      const row = detailSheet.addRow([
        detailRowIdx,
        student.fullName,
        student.grade || pack.grade || "-",
        q.position,
        toLetter(q.studentAnswer),
        toLetter(q.correctOption),
        t1Ok ? "Benar" : "Salah",
        toLetter(q.studentReason),
        toLetter(q.correctReason),
        t2Ok ? "Benar" : "Salah",
        q.confident ? "Yakin" : "Tidak yakin",
        DIAGNOSIS_LABEL[q.diagnosis],
      ]);

      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if (detailRowIdx % 2 === 0) cell.fill = ZEBRA_FILL;
        cell.alignment = {
          vertical: "middle",
          horizontal: colNum === 2 ? "left" : "center",
        };
        if (colNum === 12) {
          const style = DIAGNOSIS_CELL_STYLE[q.diagnosis];
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.bg } };
          cell.font = { bold: true, color: { argb: style.fg } };
        }
      });
    }
  }

  if (detailRowIdx === 0) {
    const emptyRow = detailSheet.addRow([
      "-",
      "Belum ada rincian jawaban siswa yang tersedia.",
    ]);
    detailSheet.mergeCells("B2:L2");
    emptyRow.font = { italic: true, color: { argb: "FF64748B" } };
  }

  autoFitColumns(detailSheet);
  detailSheet.getColumn(1).width = 6;
  detailSheet.getColumn(2).width = 26;

  // =========================================================================
  // SHEET 3: Rekap Soal
  // =========================================================================
  const itemSheet = workbook.addWorksheet("Rekap Soal", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const itemHeader = itemSheet.addRow([
    "No. Soal",
    "Indikator Soal",
    "Submateri",
    "Level",
    "Pertanyaan",
    "Kunci Jawaban",
    "Kunci Alasan",
    DIAGNOSIS_LABEL.paham,
    DIAGNOSIS_LABEL.miskonsepsi,
    DIAGNOSIS_LABEL.lucky_guess,
    DIAGNOSIS_LABEL.tidak_paham,
    "Akurasi Tier 1 (%)",
  ]);
  styleHeaderRow(itemHeader);

  type ItemAgg = {
    position: number;
    indicator: string;
    subtopic: string;
    cognitiveLevel: string;
    stem: string;
    correctOption: number;
    correctReason: number;
    paham: number;
    miskonsepsi: number;
    lucky_guess: number;
    tidak_paham: number;
    tier1Correct: number;
    total: number;
  };

  const aggMap = new Map<number, ItemAgg>();

  for (const fq of fallbackQuestions) {
    aggMap.set(fq.position, {
      position: fq.position,
      indicator: fq.indicator || "-",
      subtopic: fq.subtopic || "-",
      cognitiveLevel: fq.cognitiveLevel || "-",
      stem: fq.stem,
      correctOption: fq.correctOption,
      correctReason: fq.correctReason,
      paham: 0,
      miskonsepsi: 0,
      lucky_guess: 0,
      tidak_paham: 0,
      tier1Correct: 0,
      total: 0,
    });
  }

  for (const student of pack.students) {
    for (const q of student.questions) {
      let agg = aggMap.get(q.position);
      if (!agg) {
        agg = {
          position: q.position,
          indicator: q.indicator || "-",
          subtopic: q.subtopic || "-",
          cognitiveLevel: q.cognitiveLevel || "-",
          stem: q.stem,
          correctOption: q.correctOption,
          correctReason: q.correctReason,
          paham: 0,
          miskonsepsi: 0,
          lucky_guess: 0,
          tidak_paham: 0,
          tier1Correct: 0,
          total: 0,
        };
        aggMap.set(q.position, agg);
      } else {
        if (agg.indicator === "-" && q.indicator) agg.indicator = q.indicator;
        if (agg.subtopic === "-" && q.subtopic) agg.subtopic = q.subtopic;
        if (agg.cognitiveLevel === "-" && q.cognitiveLevel) agg.cognitiveLevel = q.cognitiveLevel;
      }
      agg[q.diagnosis] += 1;
      if (q.studentAnswer === q.correctOption) agg.tier1Correct += 1;
      agg.total += 1;
    }
  }

  const sortedItems = Array.from(aggMap.values()).sort((a, b) => a.position - b.position);
  sortedItems.forEach((item, idx) => {
    const accuracy = item.total > 0 ? Math.round((item.tier1Correct / item.total) * 100) : 0;
    const row = itemSheet.addRow([
      item.position,
      item.indicator,
      item.subtopic,
      item.cognitiveLevel,
      item.stem,
      toLetter(item.correctOption),
      toLetter(item.correctReason),
      item.paham,
      item.miskonsepsi,
      item.lucky_guess,
      item.tidak_paham,
      item.total > 0 ? accuracy : "-",
    ]);
    row.eachCell((cell, colNum) => {
      cell.border = THIN_BORDER;
      if (idx % 2 === 1) cell.fill = ZEBRA_FILL;
      const isLongText = colNum === 2 || colNum === 5;
      cell.alignment = {
        vertical: "middle",
        horizontal: isLongText || colNum === 3 ? "left" : "center",
        wrapText: isLongText,
      };
    });
  });

  autoFitColumns(itemSheet);
  itemSheet.getColumn(1).width = 10;
  itemSheet.getColumn(2).width = 38;
  itemSheet.getColumn(3).width = 20;
  itemSheet.getColumn(4).width = 10;
  itemSheet.getColumn(5).width = 48;

  return workbook;
}

export async function generateSetExportBuffer(
  pack: TeacherTestPack,
  fallbackQuestions: ExportQuestionMeta[] = [],
): Promise<Buffer> {
  const workbook = await buildSetExportWorkbook(pack, fallbackQuestions);
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}
