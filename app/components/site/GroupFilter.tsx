"use client";

import { useEffect, useRef, useState } from "react";
import { MATCH_AGE_GROUPS } from "../../lib/ageGroups";

// Korosztály-szűrő: "Összes" gomb + egyedi legördülő lista.
// Egyedi (nem natív select), hogy a lenyíló lista fehér maradjon,
// és csak a hover legyen piros. Az options felülírható (pl. edzésterv:
// akadémiai korosztályok a bajnoki lista helyett).
export default function GroupFilter({
  filter,
  setFilter,
  options = MATCH_AGE_GROUPS,
}: {
  filter: string;
  setFilter: (g: string) => void;
  options?: string[];
}) {
  const isAll = filter === "Összes";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => {
          setFilter("Összes");
          setOpen(false);
        }}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
          isAll
            ? "bg-vasasRed text-white border-vasasRed"
            : "bg-white text-navy/70 border-gray-200 hover:border-vasasRed/50 hover:text-vasasRed"
        }`}
      >
        Összes
      </button>

      <div className="relative" ref={wrapRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`inline-flex items-center gap-2 pl-4 pr-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            isAll
              ? "bg-white text-navy/70 border-gray-200 hover:border-vasasRed/50 hover:text-vasasRed"
              : "bg-vasasRed text-white border-vasasRed"
          }`}
        >
          {isAll ? "Korosztály" : filter}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label="Korosztály kiválasztása"
            data-lenis-prevent
            className="absolute left-0 top-full mt-2 z-30 min-w-[9rem] max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg py-1"
          >
            {options.map((g) => (
              <li key={g} role="option" aria-selected={filter === g}>
                <button
                  onClick={() => {
                    setFilter(g);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors hover:bg-vasasRed hover:text-white ${
                    filter === g ? "text-vasasRed" : "text-navy/80"
                  }`}
                >
                  {g}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
