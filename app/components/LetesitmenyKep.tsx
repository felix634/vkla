"use client";

import { useState } from "react";
import Image from "next/image";
import KepNezegeto from "./KepNezegeto";

// A létesítmény fő képe: kattintásra megnyílik a helyszín összes fotója
// (Tóth Patrik, 2026.10.23.). A további fotókat a Studióban, a létesítmény
// „Fotók” mezőjében lehet hozzáadni.
export default function LetesitmenyKep({
  src,
  kepek,
  nev,
  berelheto,
}: {
  src: string;
  kepek: string[];
  nev: string;
  berelheto: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const kattinthato = kepek.length > 0;

  return (
    <>
      <button
        type="button"
        disabled={!kattinthato}
        onClick={() => setIndex(0)}
        aria-label={`${nev} — fotók`}
        className="group block w-full relative aspect-[16/10] rounded-md overflow-hidden bg-navy disabled:cursor-default"
      >
        <Image
          src={src}
          alt={nev}
          fill
          className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
        {berelheto && (
          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-gold text-navy px-3 py-1 rounded-sm">
            Bérelhető
          </span>
        )}
        {kattinthato && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-navy/70 text-white px-3 py-1.5 rounded-sm backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {kepek.length > 1 ? `${kepek.length} fotó` : "Nagyítás"}
          </span>
        )}
      </button>
      <KepNezegeto kepek={kepek} index={index} setIndex={setIndex} alt={nev} />
    </>
  );
}
