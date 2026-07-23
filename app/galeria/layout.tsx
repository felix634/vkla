import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Galéria — Vasas Kubala Akadémia",
};

export default function GaleriaLayout({ children }: { children: ReactNode }) {
  return children;
}
