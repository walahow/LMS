import { NextResponse, type NextRequest } from "next/server";

/**
 * Pure UI/UX Review Mode:
 * No auth gatekeeping, no redirect loops. Any route can be visited directly.
 * Automatically clears any lingering demo cookies to ensure clean browser state.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (request.cookies.has("lms-demo-role")) {
    response.cookies.delete("lms-demo-role");
    response.cookies.set("lms-demo-role", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
