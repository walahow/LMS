import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database, UserRole } from "@/lib/database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function roleHome(role: UserRole) {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

function areaFor(pathname: string): UserRole | "public" {
  if (pathname === "/login" || pathname.startsWith("/login/")) return "public";
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/admin")) return "admin";
  return "student";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Root route '/' always redirects to /login by default
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Safe bypass when Supabase environment variables are not yet configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === "" || supabaseKey.trim() === "") {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const area = areaFor(pathname);

  // 3. Performance guard: Don't hit auth on public routes if no Supabase session cookie is present
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") || c.name.includes("auth-token"));

  if (area === "public" && !hasAuthCookie) {
    return response;
  }

  // 4. Live Supabase Session Verification
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated:
  if (!user) {
    if (area === "public") return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If authenticated:
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "student") as UserRole;

  // If user visits /login while already logged in:
  if (area === "public") {
    const url = request.nextUrl.clone();
    url.pathname = roleHome(role);
    return NextResponse.redirect(url);
  }

  // 5. Role-Based Route Authorization:
  // Admin Superuser: Albus has full supervisory access to all pages (student, teacher, admin)
  if (role === "admin") {
    return response;
  }

  // Teacher: Severus is allowed in teacher area and profile; redirected from admin
  if (role === "teacher") {
    if (area === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/teacher/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Student: Hermione is allowed in student area and profile; redirected from teacher or admin
  if (role === "student") {
    if (area === "teacher" || area === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
