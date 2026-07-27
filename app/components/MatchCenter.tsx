"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MATCH_AGE_GROUPS } from "../lib/ageGroups";
import SoonBadge from "./site/SoonBadge";
import GroupFilter from "./site/GroupFilter";

// A score csak a lejátszott mérkőzéseknél van kitöltve — ez különbözteti meg
// az Eredmények listát a Naptártól.
type Match = { group: string; date: string; time: string; team: string; opponent: string; league: string; away: boolean; score?: string };

const UPCOMING: Match[] = MATCH_AGE_GROUPS.flatMap((g, gi) =>
  Array.from({ length: 2 }, (_, k) => ({
    group: g,
    date: "—",
    time: "—:—",
    team: `Vasas Kubala ${g}`,
    opponent: "Ellenfél neve",
    league: "Bajnokság",
    away: (gi + k) % 2 === 1,
  }))
);

const RESULTS: Match[] = MATCH_AGE_GROUPS.flatMap((g, gi) =>
  Array.from({ length: 2 }, (_, k) => ({
    group: g,
    date: "—",
    time: "—:—",
    team: `Vasas Kubala ${g}`,
    opponent: "Ellenfél neve",
    league: "Bajnokság",
    away: (gi + k) % 2 === 0,
    score: "—:—",
  }))
);

const STANDINGS = Array.from({ length: 10 }, (_, i) => ({
  pos: i + 1,
  team: i === 0 ? "Vasas Kubala" : "Csapat neve",
  played: "—",
  won: "—",
  drawn: "—",
  lost: "—",
  points: "—",
  us: i === 0,
}));

function MatchRow({ m }: { m: Match }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-12 text-center flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-vasasRed">{m.group}</span>
      </div>
      <div className="w-px h-9 bg-gray-200" />
      <div className="w-16 text-center flex-shrink-0">
        <div className="text-navy font-display font-black text-sm leading-none">{m.date}</div>
        <div className="text-vasasRed text-[11px] font-bold mt-1">{m.time}</div>
      </div>
      <div className="w-px h-9 bg-gray-200" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-display font-bold text-navy">
          <span className={m.away ? "text-navy/55 truncate" : "truncate"}>{m.team}</span>
          {m.score ? (
            <span className="font-display font-black text-base text-vasasRed flex-shrink-0 px-1">{m.score}</span>
          ) : (
            <span className="text-navy/30 text-[10px] font-sans">VS</span>
          )}
          <span className={!m.away ? "text-navy/55 truncate" : "truncate"}>{m.opponent}</span>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-navy/40 mt-0.5">{m.league}</div>
      </div>
      <span
        className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex-shrink-0 ${
          m.away ? "bg-navy/5 text-navy/60" : "bg-vasasRed/10 text-vasasRed"
        }`}
      >
        {m.away ? "Idegen" : "Hazai"}
      </span>
    </div>
  );
}

export default function MatchCenter() {
  const [filter, setFilter] = useState("Összes");
  const byFilter = (m: Match) => filter === "Összes" || m.group === filter;
  const upcoming = UPCOMING.filter(byFilter);
  const results = RESULTS.filter(byFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-14">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <GroupFilter filter={filter} setFilter={setFilter} />
        <SoonBadge label="talentX / MLSZ — hamarosan" />
      </div>

      {/* Naptár */}
      <section id="naptar" className="scroll-mt-28">
        <h2 className="font-display font-black text-2xl md:text-3xl text-navy flex items-center gap-3 mb-5">
          <span className="w-1.5 h-7 bg-vasasRed rounded-sm" /> Naptár
        </h2>
        <motion.div
          key={`u-${filter}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-gray-100 rounded-md overflow-hidden bg-white"
        >
          {upcoming.length ? upcoming.map((m, i) => <MatchRow key={i} m={m} />) : (
            <div className="px-4 py-8 text-center text-sm text-navy/50">Nincs mérkőzés ehhez a korosztályhoz.</div>
          )}
        </motion.div>
      </section>

      {/* Eredmények */}
      <section id="eredmenyek" className="scroll-mt-28">
        <h2 className="font-display font-black text-2xl md:text-3xl text-navy flex items-center gap-3 mb-5">
          <span className="w-1.5 h-7 bg-royal rounded-sm" /> Eredmények
        </h2>
        <motion.div
          key={`r-${filter}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-gray-100 rounded-md overflow-hidden bg-white"
        >
          {results.length ? results.map((m, i) => <MatchRow key={i} m={m} />) : (
            <div className="px-4 py-8 text-center text-sm text-navy/50">Nincs eredmény ehhez a korosztályhoz.</div>
          )}
        </motion.div>
      </section>

      {/* Tabella */}
      <section id="tabella" className="scroll-mt-28">
        <h2 className="font-display font-black text-2xl md:text-3xl text-navy flex items-center gap-3 mb-5">
          <span className="w-1.5 h-7 bg-gold rounded-sm" /> Bajnoki tabella
        </h2>
        <div className="overflow-x-auto border border-gray-100 rounded-md">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-navy text-white text-left">
                <th className="px-4 py-3 font-semibold w-10">#</th>
                <th className="px-4 py-3 font-semibold">Csapat</th>
                <th className="px-4 py-3 font-semibold text-center">M</th>
                <th className="px-4 py-3 font-semibold text-center">GY</th>
                <th className="px-4 py-3 font-semibold text-center">D</th>
                <th className="px-4 py-3 font-semibold text-center">V</th>
                <th className="px-4 py-3 font-semibold text-center">P</th>
              </tr>
            </thead>
            <tbody>
              {STANDINGS.map((r) => (
                <tr key={r.pos} className={`border-b border-gray-100 last:border-0 ${r.us ? "bg-vasasRed/5" : ""}`}>
                  <td className="px-4 py-3 font-bold text-navy/60">{r.pos}</td>
                  <td className={`px-4 py-3 font-semibold ${r.us ? "text-vasasRed" : "text-navy"}`}>{r.team}</td>
                  <td className="px-4 py-3 text-center text-navy/70">{r.played}</td>
                  <td className="px-4 py-3 text-center text-navy/70">{r.won}</td>
                  <td className="px-4 py-3 text-center text-navy/70">{r.drawn}</td>
                  <td className="px-4 py-3 text-center text-navy/70">{r.lost}</td>
                  <td className="px-4 py-3 text-center font-display font-black text-navy">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-navy/40 mt-3">
          A tabella az MLSZ adatbank (adatbank.mlsz.hu) szinkronizálásával töltődik fel — hamarosan.
        </p>
      </section>
    </div>
  );
}
