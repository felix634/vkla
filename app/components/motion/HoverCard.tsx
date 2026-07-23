"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
  glow?: boolean;
  id?: string;
}

export default function HoverCard({
  children,
  className,
  lift = 6,
  scale = 1.015,
  glow = true,
  id,
}: HoverCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      whileHover={
        reduced
          ? undefined
          : {
              y: -lift,
              scale,
              boxShadow: glow
                ? "0 25px 50px -20px rgba(12, 33, 67, 0.45)"
                : undefined,
              transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] },
            }
      }
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
