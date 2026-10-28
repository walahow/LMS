import { NextResponse, type NextRequest } from "next/server";

/**
 * Pure UI/UX Review Mode:
 * No auth gatekeeping, no redirect loops. Any route can be visited directly.
 */
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
