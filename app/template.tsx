import React from "react";
import { PageTransition } from "@/components/PageTransition";

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
