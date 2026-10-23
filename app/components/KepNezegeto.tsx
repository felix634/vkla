"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { sized } from "../lib/sanity/imageUrl";

// Teljes képernyős képnézegető lapozással (galéria-album, létesítmény-fotók).
// Esc bezár, a nyilak lapoznak; mobilon a két szélső gomb.
export default function KepNezegeto({
  kepek,
  index,
  setIndex,
  alt,
}: {
  kepek: string[];
  index: number | null;
  setIndex: (i: number | null) => void;
  alt: string;
}) {
  const nyitva = index !== null && kepek.length > 0;
  const lapoz = (d: number) => index !== null && setIndex((index + d + kepek.length) % kepek.length);

  useEffect(() => {
    if (!nyitva) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") lapoz(1);
      if (e.key === "ArrowLeft") lapoz(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  });

  const gomb =
    "absolute top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10";

  return (
    <AnimatePresence>
      {nyitva && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-navy-deep/90 backdrop-blur-sm"
          onClick={() => setIndex(null)}
        >
          <button
            className="absolute top-5 right-5 h-10 w-10 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Bezárás"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {kepek.length > 1 && (
            <>
              <button
                className={`${gomb} left-3 md:left-6`}
                aria-label="Előző kép"
                onClick={(e) => {
                  e.stopPropagation();
                  lapoz(-1);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className={`${gomb} right-3 md:right-6`}
                aria-label="Következő kép"
                onClick={(e) => {
                  e.stopPropagation();
                  lapoz(1);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm tabular-nums">
                {index! + 1} / {kepek.length}
              </div>
            </>
          )}
          <motion.div
            key={index}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full max-w-5xl aspect-[16/10] rounded-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={sized(kepek[index!], 1600) ?? kepek[index!]} alt={alt} fill className="object-contain" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
