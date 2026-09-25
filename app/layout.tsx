import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMS Diagnostik",
  description: "Platform tes diagnostik tiga tingkat untuk mendeteksi miskonsepsi siswa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
