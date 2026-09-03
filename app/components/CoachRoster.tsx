"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SoonBadge from "./site/SoonBadge";
import { sized } from "../lib/sanity/imageUrl";
import type { CsapatData } from "../lib/sanity/tartalom";

// Edző-központú korosztály-rács. A jegyzőkönyv kérése: "X játékos helyett az
// edző neve kattintható és feldobja a játékosokat képpel." → a kártyán az edző
// szerepel, kattintásra modal a keret játékosaival.

// Helykitöltő csapatok — amíg a CMS nincs bekötve.
const PLACEHOLDER_TEAMS: CsapatData[] = [
  "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "Női",
].map((name) => ({
  name,
  section: name === "Női" ? "Női szakág" : null,
  coachName: "Edző neve",
  coachRole: null,
  coachPhotoUrl: null,
  assistants: null,
  players: null,
}));

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function CoachAvatar({
  name,
  photoUrl,
  size,
}: {
  name: string | null;
  photoUrl: string | null;
  size: number;
}) {
  return (
    <span
      className="relative rounded-full overflow-hidden ring-2 ring-gold/40 flex-shrink-0 bg-gold/15 flex items-center justify-center"
      style={{ height: size, width: size }}
    >
      {photoUrl ? (
        // A 2:3-as portrékon a fej felül van — a kör-avatár a kép tetejét mutassa.
        <Image src={sized(photoUrl, size * 2)!} alt={name ?? "Edző"} fill className="object-cover object-top" />
      ) : (
        <span className="font-display font-bold text-gold" style={{ fontSize: size * 0.34 }}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}

export default function CoachRoster({ teams }: { teams?: CsapatData[] | null }) {
  const reduced = useReducedMotion();
  const list = teams && teams.length > 0 ? teams : PLACEHOLDER_TEAMS;
  const [selected, setSelected] = useState<CsapatData | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {list.map((g) => {
          const noi = g.section === "Női szakág";
          return (
            <motion.button
              key={g.name}
              onClick={() => setSelected(g)}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -6,
                      borderColor: noi ? "rgba(225,29,46,0.9)" : "rgba(184,152,92,0.7)",
                      transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
                    }
              }
              whileTap={{ scale: 0.97 }}
              className={`group relative text-left p-4 rounded-md border overflow-hidden ${
                noi ? "border-vasasRed/60 bg-vasasRed/10" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <CoachAvatar name={g.coachName} photoUrl={g.coachPhotoUrl} size={40} />
                <span className="font-display font-black text-xl text-gold-light leading-none">
                  {g.name}
                </span>
              </div>
              <div className="text-[11px] text-white/70 mt-3 truncate">
                {g.coachName ?? "Edző neve"}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-gold group-hover:text-gold-light transition-colors">
                Névsor
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </motion.button>
          );
        })}
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
            <div
              className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
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
                <div className="flex items-center gap-4 min-w-0">
                  <CoachAvatar name={selected.coachName} photoUrl={selected.coachPhotoUrl} size={48} />
                  <div className="min-w-0">
                    <div className="font-display font-black text-2xl text-gold-light leading-none">
                      {selected.name}
                    </div>
                    <div className="text-sm text-white/60 mt-1 truncate">
                      {selected.coachName ?? "Edző neve"} · vezetőedző
                    </div>
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

              <div className="px-6 py-5">
                {selected.assistants && selected.assistants.length > 0 && (
                  <div className="mb-4 text-sm text-white/70">
                    <span className="text-white/45 uppercase tracking-wider text-[11px] mr-2">
                      Asszisztensek:
                    </span>
                    {selected.assistants.join(", ")}
                  </div>
                )}

                {selected.players && selected.players.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selected.players.map((p, i) => (
                      <div key={i} className="rounded-md border border-white/10 bg-white/5 overflow-hidden">
                        <div className="relative aspect-[4/5] bg-navy-dark flex items-center justify-center">
                          {p.photoUrl ? (
                            <Image src={sized(p.photoUrl, 400)!} alt={p.name} fill className="object-cover opacity-90" />
                          ) : (
                            <span className="font-display font-black text-3xl text-white/15">
                              {initials(p.name)}
                            </span>
                          )}
                          {p.number != null && (
                            <span className="absolute top-2 left-2 h-6 w-6 rounded-sm bg-vasasRed text-white text-xs font-bold flex items-center justify-center">
                              {p.number}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <div className="text-sm font-semibold truncate">{p.name}</div>
                          {p.position && <div className="text-[11px] text-gold-light">{p.position}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-white/10 bg-white/5 px-5 py-8 text-center">
                    <div className="text-white/70 mb-3">A játékos-névsor feltöltés alatt.</div>
                    <SoonBadge label="Névsor és fotók — hamarosan" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
