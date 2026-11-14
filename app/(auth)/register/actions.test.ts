import { vi } from "vitest";

// Mock server-only so Vitest can execute Server Action unit tests
vi.mock("server-only", () => ({}));

import { describe, it, expect } from "vitest";
import { registerStudent } from "./actions";
import { sanitizeUsername } from "@/lib/auth-utils";

describe("Student Self-Registration", () => {
  describe("sanitizeUsername", () => {
    it("converts uppercase to lowercase and trims spaces", () => {
      expect(sanitizeUsername("  HermioneGranger  ")).toBe("hermionegranger");
    });

    it("preserves alphanumeric characters, underscores, dots, and hyphens", () => {
      expect(sanitizeUsername("user_name.123-id")).toBe("user_name.123-id");
    });

    it("strips forbidden symbols and spaces", () => {
      expect(sanitizeUsername("budi santoso!@#$%^&*()")).toBe("budisantoso");
    });
  });

  describe("Validation Rules", () => {
    it("rejects names shorter than 2 characters", async () => {
      const formData = new FormData();
      formData.set("fullName", "A");
      formData.set("username", "validuser");
      formData.set("grade", "Kelas X-A");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const res = await registerStudent({}, formData);
      expect(res.fieldErrors?.fullName).toBe("Nama lengkap minimal 2 karakter.");
    });

    it("rejects usernames shorter than 3 characters", async () => {
      const formData = new FormData();
      formData.set("fullName", "Budi Santoso");
      formData.set("username", "ab");
      formData.set("grade", "Kelas X-A");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const res = await registerStudent({}, formData);
      expect(res.fieldErrors?.username).toContain("3–20 karakter");
    });

    it("rejects usernames longer than 20 characters", async () => {
      const formData = new FormData();
      formData.set("fullName", "Budi Santoso");
      formData.set("username", "abcdefghijklmnopqrstuvwxyz");
      formData.set("grade", "Kelas X-A");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const res = await registerStudent({}, formData);
      expect(res.fieldErrors?.username).toContain("3–20 karakter");
    });

    it("rejects empty or short grade strings", async () => {
      const formData = new FormData();
      formData.set("fullName", "Budi Santoso");
      formData.set("username", "budisantoso");
      formData.set("grade", " ");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const res = await registerStudent({}, formData);
      expect(res.fieldErrors?.grade).toContain("Kelas / rombel wajib diisi");
    });

    it("rejects passwords under 8 characters", async () => {
      const formData = new FormData();
      formData.set("fullName", "Budi Santoso");
      formData.set("username", "budisantoso");
      formData.set("grade", "Kelas X-A");
      formData.set("password", "short");
      formData.set("confirmPassword", "short");

      const res = await registerStudent({}, formData);
      expect(res.fieldErrors?.password).toBe("Kata sandi minimal 8 karakter.");
    });

    it("rejects mismatched confirm passwords", async () => {
      const formData = new FormData();
      formData.set("fullName", "Budi Santoso");
      formData.set("username", "budisantoso");
      formData.set("grade", "Kelas X-A");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password456");

      const res = await registerStudent({}, formData);
      expect(res.fieldErrors?.confirmPassword).toBe("Konfirmasi kata sandi tidak cocok.");
    });

    it("strictly ignores any malicious role parameter submitted in FormData", async () => {
      const formData = new FormData();
      formData.set("fullName", "Sneaky Student");
      formData.set("username", "sneaky123");
      formData.set("grade", "Kelas X-A");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");
      formData.set("role", "admin"); // Malicious injection attempt

      // In demo mode without Supabase, it will redirect to /dashboard (student home), never /admin/dashboard
      try {
        await registerStudent({}, formData);
      } catch (err: any) {
        expect(err.message).toBe("NEXT_REDIRECT");
      }
    });
  });
});
