"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: string;
  /** Jobb oldali kiegészítő tartalom (pl. gomb, jelölés). */
  aside?: ReactNode;
}

// Egységes aloldal-fejléc sáv. Minden aloldal ezt használja a vizuális
// összhang érdekében (navy háttér, rács, arany akcentus, cím + morzsamenü).
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  aside,
}: PageHeroProps) {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-royal/25 pointer-events-none" />
      {/* Bal oldali ferde piros akcentus */}
      <div className="hidden lg:block absolute -left-32 top-0 bottom-0 w-80 -skew-x-12 bg-gradient-to-b from-vasasRed/25 to-transparent pointer-events-none" />
      {/* Arany vonal alul */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-gradient" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="max-w-3xl">
            {breadcrumb && (
              <div className="mb-5">
                <Breadcrumb current={breadcrumb} />
              </div>
            )}
            <span className="section-eyebrow">{eyebrow}</span>
            <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl mt-3 mb-4">
              {title}
            </h1>
            <div className="gold-divider" />
            {subtitle && (
              <p className="text-white/75 text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {aside && <div className="flex-shrink-0">{aside}</div>}
        </motion.div>
      </div>
    </section>
  );
}
