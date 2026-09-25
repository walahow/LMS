import { redirect } from "next/navigation";

// Middleware already redirects "/" to /login or the caller's role dashboard.
// This is only a fallback for the rare request that reaches the page itself.
export default function RootPage() {
  redirect("/login");
}
