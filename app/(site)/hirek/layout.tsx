import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hírek — Vasas Kubala Akadémia",
};

export default function HirekLayout({ children }: { children: ReactNode }) {
  return children;
}
