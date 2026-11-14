# Specification: Student Self-Registration (Username-First)

## 1. Objective
Enable students to self-register their accounts without requiring administrative intervention, while strictly locking self-registration to the `student` role. Teachers and Administrators cannot self-register; they remain provisioned by administrators.

Students in Indonesian secondary schools frequently lack active or reliable personal email addresses. Registration will therefore be **username-first**:
- Student inputs: **Full Name**, **Username**, **Grade / Class (string)**, and **Password**.
- The system maps usernames internally to a valid synthetic domain (`${username}@lms.local`) for Supabase Auth, completely avoiding email verification bottlenecks.
- Existing teacher/admin accounts with actual emails continue to work seamlessly.
- Login accepts either **Username** or **Email**.

---

## 2. User Experience & Flows

### A. Student Registration View (`/register`)
- **Route**: `/(auth)/register`
- **Ergonomics & Aesthetic**: Centered mobile-first card (`maxWidth: 420px`), Electric Royal Blue accents, 3-tier brand bar, tactile `.boxy-input`, and `.boxy-btn-dither-accent` matching HYDE design principles.
- **Form Inputs**:
  1. `Nama Lengkap` (`fullName`): Student's full name (e.g. `Budi Santoso`, min 2 characters).
  2. `Username` (`username`): Alphanumeric identifier, lowercase (e.g. `budisantoso`, 3–20 characters, regex `/^[a-zA-Z0-9_.-]+$/`).
  3. `Kelas / Rombel` (`grade`): Free-text string (e.g. `Kelas X-A`, `10 MIPA 1`, `XII RPL 2`).
  4. `Kata Sandi` (`password`): Min 8 characters with unified `BoxyPasswordInput` and interactive diagonal SVG eye toggle.
  5. `Konfirmasi Kata Sandi` (`confirmPassword`): Must match password.
- **Role Locking**: Strictly hardcoded to `'student'`. No role selection is exposed to the user or accepted from the payload.
- **Post-Registration Behavior**:
  - Direct instant activation & login: upon successful submission, the session is established and the user is redirected immediately to `/dashboard`.
- **Navigation Links**:
  - `Sudah punya akun? [ MASUK DI SINI ➔ ]` navigating back to `/login`.

### B. Login View Enhancements (`/login`)
- Update identifier input:
  - Label changed to: `USERNAME / EMAIL`.
  - Placeholder: `username atau email@sekolah.sch.id`.
  - Auto-normalization: if the input does not contain `@`, automatically append `@lms.local` before authenticating.
- Update policy text:
  - Replace the old "Registrasi ditutup" callout with a clear CTA banner:
    `Belum punya akun siswa? [ DAFTAR AKUN SISWA BARU ➔ ]` navigating to `/register`.

---

## 3. Technical Architecture & Security

### A. Route Protection (`proxy.ts`)
- Update `areaFor(pathname)` in Next.js Edge proxy to include `/register` in public areas:
  ```ts
  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname.startsWith("/register/")
  ) return "public";
  ```
- If an already authenticated user navigates to `/register`, redirect them directly to their role dashboard (`roleHome(role)`).

### B. Server Action (`app/(auth)/register/actions.ts`)
- `registerStudentAction(formData)`:
  - Input validation:
    - `fullName`: trimmed, length >= 2
    - `username`: sanitized, alphanumeric + `_`, `.`, `-`, length 3–20
    - `grade`: trimmed, length >= 2
    - `password`: length >= 8
    - `confirmPassword`: matches `password`
  - Synthetic email generation: `${sanitizedUsername.toLowerCase()}@lms.local`
  - Supabase integration:
    - Check if username/email already exists.
    - Create user via `createAdminClient().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name, grade, username } })`.
    - Upsert into `profiles`: `{ id: user.id, full_name, role: 'student', grade, username }`.
    - Sign in immediately using `supabase.auth.signInWithPassword({ email, password })`.
    - Revalidate paths and redirect to `/dashboard`.
  - Offline/Demo fallback:
    - If `isSupabaseConfigured() === false`, return success and redirect to `/dashboard`.

### C. Database Migration (`supabase/migrations/0004_profile_grade_username.sql`)
- Add `grade` and `username` columns to `profiles`:
  ```sql
  alter table profiles add column if not exists grade text;
  alter table profiles add column if not exists username text unique;
  ```
- Update `lib/database.types.ts` to include `grade` and `username` in `profiles`.

---

## 4. Testing & Verification Plan

1. **Unit Tests**:
   - Add test suite covering:
     - Username format validation (alphanumeric, forbidden characters, min length).
     - Password confirmation validation and minimum length check.
     - Role locking assertion (verifying that no external parameter can escalate role).
     - Username-to-email mapping logic.
2. **End-to-End & Integration Verification**:
   - `npm run test` (all tests passing).
   - `npm run typecheck` (0 TypeScript errors).
   - Test registration flow on `/register` -> auto-login to `/dashboard`.
   - Test login with newly registered username on `/login`.
