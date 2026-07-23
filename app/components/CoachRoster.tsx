"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AGE_GROUPS, type AgeGroup } from "../lib/ageGroups";
import { placeholderRoster, COACH_PHOTO } from "../lib/teams";
import SoonBadge from "./site/SoonBadge";

// Edző-központú korosztály-rács. A jegyzőkönyv kérése: "X játékos helyett az
// edző neve kattintható és feldobja a játékosokat képpel." → a kártyán az edző
// szerepel, kattintásra modal a keret játékosaival (képekkel).
export default function CoachRoster({
  groups = AGE_GROUPS,
}: {
  groups?: AgeGroup[];
}) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<AgeGroup | null>(null);

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const roster = placeholderRoster(selected?.name === "Női" ? 18 : 16);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {groups.map((g) => (
          <motion.button
            key={g.name}
            onClick={() => setSelected(g)}
            whileHover={
              reduced
                ? undefined
                : {
                    y: -6,
                    borderColor: g.highlight ? "rgba(225,29,46,0.9)" : "rgba(184,152,92,0.7)",
                    transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
                  }
            }
            whileTap={{ scale: 0.97 }}
            className={`group relative text-left p-4 rounded-md border overflow-hidden ${
              g.highlight ? "border-vasasRed/60 bg-vasasRed/10" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-gold/40 flex-shrink-0">
                <Image src={COACH_PHOTO} alt="Edző" fill className="object-cover" />
              </span>
              <span className="font-display font-black text-2xl text-gold-light leading-none">{g.name}</span>
            </div>
            <div className="text-[11px] text-white/70 mt-3 truncate">Edző neve</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-gold group-hover:text-gold-light transition-colors">
              Névsor
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            {g.highlight && (
              <div className="absolute -top-2 -right-2 text-[9px] uppercase tracking-wider font-bold bg-vasasRed text-white px-2 py-0.5 rounded-sm">
                Új
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              data-lenis-prevent
              initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative w-full md:max-w-3xl bg-navy text-white rounded-t-lg md:rounded-lg border border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Fejléc */}
              <div className="sticky top-0 bg-navy/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-4">
                  <span className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-gold/50 flex-shrink-0">
                    <Image src={COACH_PHOTO} alt="Edző" fill className="object-cover" />
                  </span>
                  <div>
                    <div className="font-display font-black text-2xl text-gold-light leading-none">
                      {selected.name} keret
                    </div>
                    <div className="text-sm text-white/60 mt-1">Edző neve · korosztály vezetőedző</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="h-9 w-9 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/15 transition-colors flex-shrink-0"
                  aria-label="Bezárás"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Játékosok */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4 text-xs text-white/50">
                  <SoonBadge label="MLSZ adatbank — hamarosan" />
                  <span>A névsor és a képek később töltődnek fel.</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {roster.map((p, i) => (
                    <div key={i} className="rounded-md border border-white/10 bg-white/5 overflow-hidden">
                      <div className="relative aspect-[4/5] bg-navy-dark">
                        <Image src={p.photo} alt="Játékos" fill className="object-cover opacity-90" />
                        <span className="absolute top-2 left-2 h-6 w-6 rounded-sm bg-vasasRed text-white text-xs font-bold flex items-center justify-center">
                          {p.number}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <div className="text-sm font-semibold truncate">{p.name}</div>
                        <div className="text-[11px] text-gold-light">{p.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
