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

describe("UI/UX Review Mode Auth & Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to teacher dashboard when selecting teacher role", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "teacher@lms.local");
    formData.append("demoRole", "teacher");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/teacher/dashboard");
  });

  it("redirects to admin dashboard when selecting admin role", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "admin@lms.local");
    formData.append("demoRole", "admin");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("redirects to student dashboard when selecting student role", async () => {
    const { signIn } = await import("@/app/(auth)/login/actions");

    const formData = new FormData();
    formData.append("email", "rani@lms.local");
    formData.append("demoRole", "student");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects cleanly to /login upon signOut", async () => {
    const { signOut } = await import("@/lib/auth-actions");

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("provides mock profile without throwing in requireRole", async () => {
    const { requireRole } = await import("@/lib/auth");

    const teacher = await requireRole("teacher");
    expect(teacher.profile.role).toBe("teacher");
    expect(teacher.profile.full_name).toContain("Sari");

    const admin = await requireRole("admin");
    expect(admin.profile.role).toBe("admin");
    expect(admin.profile.full_name).toContain("Andi");

    const student = await requireRole("student");
    expect(student.profile.role).toBe("student");
    expect(student.profile.full_name).toContain("Rani");
  });
});
