import { RegisterView } from "@/components/RegisterView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Siswa — LMS Diagnostik",
  description: "Pendaftaran mandiri akun siswa untuk tes diagnostik tiga tingkat.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
