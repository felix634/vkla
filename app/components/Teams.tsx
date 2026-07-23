"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import CoachRoster from "./CoachRoster";
import { EXTERNAL } from "../lib/nav";

export default function Teams() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div>
            <span className="section-eyebrow">Csapataink</span>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl mt-3 mb-3">
              16 korosztály.
              <br />
              <span className="text-gold-light">Egy közös cél.</span>
            </h2>
            <div className="gold-divider" />
          </div>
          <p className="text-white/70 max-w-md text-base leading-relaxed">
            U5-től U19-ig képezzük a következő generáció labdarúgóit. Válaszd ki
            a korosztályt, és az edzőre kattintva megnézheted a keret játékosait.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <CoachRoster />
        </motion.div>

        <motion.div
          className="mt-12 flex flex-wrap gap-4 items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/kapcsolat#probaedzes">
            <motion.span
              whileHover={reduced ? undefined : { y: -3, boxShadow: "0 18px 36px -16px rgba(225,29,46,0.55)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-block bg-vasasRed hover:bg-vasasRedDark px-7 py-3.5 font-bold rounded-sm text-sm"
            >
              Csatlakozz egy csapathoz
            </motion.span>
          </Link>
          <a href={EXTERNAL.vasasFcII} target="_blank" rel="noopener noreferrer">
            <motion.span
              whileHover={reduced ? undefined : { y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 border-2 border-white/20 hover:border-gold hover:text-gold transition-colors px-7 py-3.5 font-bold rounded-sm text-sm"
            >
              Vasas FC II oldala
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 17L17 7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
