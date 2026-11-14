import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchTeacherPackById } from "@/lib/teacher-data";
import { buildExportFilename, generateSetExportBuffer } from "@/lib/export-spreadsheet";
import type { UserRole } from "@/lib/database.types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params;
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");

  let includeDrafts = false;
  let supabaseClient: any = undefined;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sesi Anda telah berakhir. Silakan login kembali." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as UserRole | undefined;
    if (role !== "teacher" && role !== "admin") {
      return NextResponse.json(
        { error: "Hanya guru atau admin yang dapat mengunduh rekap Excel." },
        { status: 403 },
      );
    }

    if (role === "admin") {
      includeDrafts = true;
      supabaseClient = createAdminClient();
    } else {
      includeDrafts = false;
      supabaseClient = supabase;
    }
  } else {
    includeDrafts = scope === "admin";
  }

  const result = await fetchTeacherPackById(setId, {
    includeDrafts,
    supabaseClient,
  });

  if (!result) {
    return NextResponse.json(
      { error: "Paket soal tidak ditemukan atau belum dipublikasikan." },
      { status: 404 },
    );
  }

  const buffer = await generateSetExportBuffer(result.pack, result.questionsMeta);
  const filename = buildExportFilename(result.pack.title);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
