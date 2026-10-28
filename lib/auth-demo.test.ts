import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    const err = new Error("NEXT_REDIRECT");
    (err as any).digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw err;
  },
}));

// Mock next/headers cookies
const mockCookiesStore = new Map<string, any>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (key: string) => mockCookiesStore.get(key),
    set: (key: string, val: string, opts?: any) => {
      mockCookiesStore.set(key, { name: key, value: val, ...opts });
    },
    delete: (key: string) => {
      mockCookiesStore.delete(key);
    },
  }),
}));

// Mock supabase server
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: async () => ({
        error: new Error("Invalid login credentials"),
        data: { user: null },
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null } }),
    },
  }),
}));

describe("Demo Account Fallback Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesStore.clear();
  });

  it("falls back to mock teacher dashboard when using teacher@lms.local even if Supabase fails", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "teacher@lms.local");
    formData.append("password", "password123");
    formData.append("demoRole", "teacher");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/teacher/dashboard");
    expect(mockCookiesStore.get("lms-demo-role")?.value).toBe("teacher");
  });

  it("falls back to mock admin dashboard when using admin@lms.local even if Supabase fails", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "admin@lms.local");
    formData.append("password", "password123");
    formData.append("demoRole", "admin");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");
    expect(mockCookiesStore.get("lms-demo-role")?.value).toBe("admin");
  });

  it("falls back to mock student dashboard when using rani@lms.local even if Supabase fails", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "rani@lms.local");
    formData.append("password", "password123");
    formData.append("demoRole", "student");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    expect(mockCookiesStore.get("lms-demo-role")?.value).toBe("student");
  });

  it("rejects non-demo account when Supabase auth fails", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "unknown@example.com");
    formData.append("password", "wrongpass");

    const result = await signIn({}, formData);
    expect(result).toEqual({ error: "Email atau kata sandi salah." });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockCookiesStore.get("lms-demo-role")).toBeUndefined();
  });
});
