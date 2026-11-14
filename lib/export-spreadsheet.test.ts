import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { DIAGNOSIS_LABEL } from "./diagnose";
import { MOCK_TEST_PACKS } from "./teacher-data";
import { buildExportFilename, buildSetExportWorkbook, generateSetExportBuffer } from "./export-spreadsheet";

describe("spreadsheet export (.xlsx)", () => {
  it("builds a clean filename with slug and date", () => {
    const filename = buildExportFilename("Hukum Newton tentang Gerak & Gaya", new Date("2026-11-13T10:00:00Z"));
    expect(filename).toBe("hasil-hukum-newton-tentang-gerak-gaya-20261113.xlsx");
  });

  it("generates a 3-sheet workbook matching student scores and diagnostic counts", async () => {
    const pack = MOCK_TEST_PACKS[0];
    const workbook = await buildSetExportWorkbook(pack);

    expect(workbook.worksheets.map((ws) => ws.name)).toEqual([
      "Ringkasan Siswa",
      "Detail Per Soal",
      "Rekap Soal",
    ]);

    const summarySheet = workbook.getWorksheet("Ringkasan Siswa")!;
    const headerRow = summarySheet.getRow(7);
    expect(headerRow.getCell(6).value).toBe(DIAGNOSIS_LABEL.paham);
    expect(headerRow.getCell(7).value).toBe(DIAGNOSIS_LABEL.miskonsepsi);
    expect(headerRow.getCell(8).value).toBe(DIAGNOSIS_LABEL.lucky_guess);
    expect(headerRow.getCell(9).value).toBe(DIAGNOSIS_LABEL.tidak_paham);

    // First student row at row 8 matches pack.students[0]
    const firstStudentRow = summarySheet.getRow(8);
    expect(firstStudentRow.getCell(2).value).toBe(pack.students[0].fullName);
    expect(firstStudentRow.getCell(5).value).toBe(pack.students[0].score);
    expect(firstStudentRow.getCell(6).value).toBe(pack.students[0].diagnosticsCount.paham);
    expect(firstStudentRow.getCell(10).value).toBe(DIAGNOSIS_LABEL[pack.students[0].dominantDiagnosis]);

    // Detail sheet has 1 header + total responses rows
    const detailSheet = workbook.getWorksheet("Detail Per Soal")!;
    const expectedDetailCount = pack.students.reduce((sum, s) => sum + s.questions.length, 0);
    expect(detailSheet.rowCount).toBe(1 + expectedDetailCount);

    // Rekap Soal has 1 header + pack.questionCount rows
    const itemSheet = workbook.getWorksheet("Rekap Soal")!;
    expect(itemSheet.rowCount).toBe(1 + pack.questionCount);
  });

  it("produces a valid readable .xlsx binary buffer even when no student submitted yet", async () => {
    const emptyPack = {
      ...MOCK_TEST_PACKS[0],
      studentAttemptCount: 0,
      diagnosticsCount: { paham: 0, miskonsepsi: 0, lucky_guess: 0, tidak_paham: 0 },
      students: [],
    };

    const buffer = await generateSetExportBuffer(emptyPack, [
      {
        position: 1,
        indicator: "Menganalisis Hukum II Newton",
        subtopic: "Hukum II Newton",
        cognitiveLevel: "C4",
        stem: "Pertanyaan contoh 1",
        correctOption: 4,
        correctReason: 0,
      },
    ]);

    const parsed = new ExcelJS.Workbook();
    await parsed.xlsx.load(buffer as any);
    expect(parsed.worksheets.length).toBe(3);

    const itemSheet = parsed.getWorksheet("Rekap Soal")!;
    expect(itemSheet.getRow(2).getCell(2).value).toBe("Menganalisis Hukum II Newton");
    expect(itemSheet.getRow(2).getCell(3).value).toBe("Hukum II Newton");
    expect(itemSheet.getRow(2).getCell(4).value).toBe("C4");
    expect(itemSheet.getRow(2).getCell(5).value).toBe("Pertanyaan contoh 1");
    expect(itemSheet.getRow(2).getCell(6).value).toBe("E");
    expect(itemSheet.getRow(2).getCell(12).value).toBe("-");
  });
});
