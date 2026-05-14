"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface HoverButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
}

export default function HoverButton({
  children,
  className,
  variant = "primary",
}: HoverButtonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      className={`no-click ${className ?? ""}`}
      whileHover={
        reduced
          ? undefined
          : {
              y: -2,
              transition: { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] },
            }
      }
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      data-variant={variant}
    >
      {children}
    </motion.button>
  );
}
