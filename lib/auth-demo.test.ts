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
    formData.append("email", "student@lms.local");
    formData.append("demoRole", "student");

    await expect(signIn({}, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects cleanly to /login upon signOut", async () => {
    const { signOut } = await import("@/lib/auth-actions");

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects root path / to /login by default", async () => {
    const RootPage = (await import("@/app/page")).default;

    expect(() => RootPage()).toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("provides mock profile without throwing in requireRole", async () => {
    const { requireRole } = await import("@/lib/auth");

    const teacher = await requireRole("teacher");
    expect(teacher.profile.role).toBe("teacher");
    expect(teacher.profile.full_name).toContain("Snape");

    const admin = await requireRole("admin");
    expect(admin.profile.role).toBe("admin");
    expect(admin.profile.full_name).toContain("Albus");

    const student = await requireRole("student");
    expect(student.profile.role).toBe("student");
    expect(student.profile.full_name).toContain("Hermione");
  });
});

describe("Change Password Validation & Feedback Messages", () => {
  it("rejects empty new password with clear error message", async () => {
    const { changePassword } = await import("@/lib/auth-actions");
    const formData = new FormData();
    formData.append("password", "");
    formData.append("confirm", "password123");

    const result = await changePassword({}, formData);
    expect(result.error).toBe("Kata sandi baru tidak boleh kosong.");
  });

  it("rejects short password (< 8 chars) showing current length", async () => {
    const { changePassword } = await import("@/lib/auth-actions");
    const formData = new FormData();
    formData.append("password", "abc12");
    formData.append("confirm", "abc12");

    const result = await changePassword({}, formData);
    expect(result.error).toBe("Kata sandi baru minimal 8 karakter (saat ini 5 karakter).");
  });

  it("rejects missing confirmation password", async () => {
    const { changePassword } = await import("@/lib/auth-actions");
    const formData = new FormData();
    formData.append("password", "password123");
    formData.append("confirm", "");

    const result = await changePassword({}, formData);
    expect(result.error).toBe("Harap masukkan konfirmasi kata sandi baru.");
  });

  it("rejects mismatched confirmation password", async () => {
    const { changePassword } = await import("@/lib/auth-actions");
    const formData = new FormData();
    formData.append("password", "password123");
    formData.append("confirm", "password456");

    const result = await changePassword({}, formData);
    expect(result.error).toBe("Konfirmasi kata sandi tidak cocok dengan kata sandi baru.");
  });

  it("successfully validates matching passwords >= 8 chars", async () => {
    const { changePassword } = await import("@/lib/auth-actions");
    const formData = new FormData();
    formData.append("password", "newSecret123");
    formData.append("confirm", "newSecret123");

    const result = await changePassword({}, formData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Kata sandi berhasil diperbarui!");
  });

  it("supports newPassword and confirmPassword alias keys", async () => {
    const { changePassword } = await import("@/lib/auth-actions");
    const formData = new FormData();
    formData.append("newPassword", "robustPassword2026");
    formData.append("confirmPassword", "robustPassword2026");

    const result = await changePassword({}, formData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Kata sandi berhasil diperbarui!");
  });
});
